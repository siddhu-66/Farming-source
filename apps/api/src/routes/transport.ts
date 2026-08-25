import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import axios from 'axios';

const router = Router();

function mapKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapKeys);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = mapKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
}

router.use(authenticate, authorizeRole('transport'));

// ============================================
// VEHICLE MANAGEMENT
// ============================================

// GET /api/transport/vehicles
router.get('/vehicles', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*, driver:users!driver_id(*)')
      .eq('transporter_id', transporterId);
      
    if (error) throw error;
    res.json({ success: true, data: mapKeys({ vehicles }) });
  } catch (err) { next(err); }
});

// POST /api/transport/vehicles
router.post('/vehicles', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const schema = z.object({
      registrationNumber: z.string().min(5).toUpperCase(),
      type: z.enum(['truck', 'mini_truck', 'tractor', 'tempo', 'container']),
      capacity: z.number().min(0),
      capacityUnit: z.enum(['kg', 'ton']),
      model: z.string(),
      make: z.string(),
      year: z.number().min(1990).max(new Date().getFullYear() + 1),
      color: z.string().optional(),
    });
    const data = schema.parse(req.body);
    
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert([{ 
        registration_number: data.registrationNumber,
        type: data.type,
        capacity: data.capacity,
        capacity_unit: data.capacityUnit,
        model: data.model,
        make: data.make,
        year: data.year,
        color: data.color,
        transporter_id: transporterId 
      }])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Vehicle registered', data: mapKeys({ vehicle }) });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// PUT /api/transport/vehicles/:id
router.put('/vehicles/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    // Convert keys in req.body manually or partially
    const updates: any = {};
    if (req.body.registrationNumber) updates.registration_number = req.body.registrationNumber;
    if (req.body.capacityUnit) updates.capacity_unit = req.body.capacityUnit;
    if (req.body.type) updates.type = req.body.type;
    if (req.body.capacity) updates.capacity = req.body.capacity;
    if (req.body.model) updates.model = req.body.model;
    if (req.body.make) updates.make = req.body.make;
    if (req.body.year) updates.year = req.body.year;
    if (req.body.color) updates.color = req.body.color;

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', req.params.id)
      .eq('transporter_id', transporterId)
      .select()
      .single();
      
    if (error) throw error;
    if (!vehicle) throw createApiError(404, 'Vehicle not found');
    res.json({ success: true, message: 'Vehicle updated', data: mapKeys({ vehicle }) });
  } catch (err) { next(err); }
});

// PATCH /api/transport/vehicles/:id/location
router.patch('/vehicles/:id/location', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { lat, lng, bookingId } = req.body;
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update({ current_location: { lat, lng } })
      .eq('id', req.params.id)
      .eq('transporter_id', transporterId)
      .select()
      .single();
      
    if (error) throw error;
    if (!vehicle) throw createApiError(404, 'Vehicle not found');

    // Broadcast live location to relevant parties
    const io = (req as any).io;
    if (io && bookingId) {
      io.to(`booking_${bookingId}`).emit('location_update', { bookingId, location: { lat, lng } });

      const { data: booking } = await supabase.from('transport_bookings').select('checkpoints').eq('id', bookingId).single();
      if (booking) {
        const checkpoints = booking.checkpoints || [];
        checkpoints.push({ location: { lat, lng }, timestamp: new Date() });
        await supabase.from('transport_bookings')
          .update({ current_location: { lat, lng }, checkpoints })
          .eq('id', bookingId);
      }
    }

    res.json({ success: true, message: 'Location updated' });
  } catch (err) { next(err); }
});

// ============================================
// BOOKINGS
// ============================================

// GET /api/transport/bookings
router.get('/bookings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    let query = supabase
      .from('transport_bookings')
      .select('*, farmer:users!farmer_id(name, phone, avatar), vehicle:vehicles!vehicle_id(registration_number, type)', { count: 'exact' });

    if (status === 'available') {
      query = query.eq('status', 'requested').is('transporter_id', null);
    } else if (status) {
      query = query.eq('status', status).eq('transporter_id', transporterId);
    } else {
      query = query.or(`transporter_id.eq.${transporterId},and(status.eq.requested,transporter_id.is.null)`);
    }

    const { data: bookings, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    res.json({ success: true, data: mapKeys({ bookings, ...buildPaginationResponse(total || 0, page, limit) }) });
  } catch (err) { next(err); }
});

// PATCH /api/transport/bookings/:id/accept
router.patch('/bookings/:id/accept', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { vehicleId, fare } = req.body;

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('transporter_id', transporterId)
      .eq('status', 'available')
      .single();
      
    if (!vehicle) throw createApiError(400, 'Vehicle not available');

    const { data: booking, error } = await supabase
      .from('transport_bookings')
      .update({
        transporter_id: transporterId,
        vehicle_id: vehicleId,
        status: 'accepted',
        fare,
      })
      .eq('id', req.params.id)
      .eq('status', 'requested')
      .select()
      .single();
      
    if (error || !booking) throw createApiError(404, 'Booking not found or already taken');

    // Mark vehicle as assigned
    await supabase.from('vehicles').update({ status: 'on_trip' }).eq('id', vehicleId);

    // Notify farmer
    const io = (req as any).io;
    if (io && booking.farmer_id) {
      io.to(`user_${booking.farmer_id}`).emit('notification', {
        type: 'transport_assigned',
        title: 'Transport Assigned!',
        message: `A transporter has accepted your booking. Vehicle: ${vehicle.registration_number}`,
      });
    }

    res.json({ success: true, message: 'Booking accepted', data: mapKeys({ booking }) });
  } catch (err) { next(err); }
});

// PATCH /api/transport/bookings/:id/pickup
router.patch('/bookings/:id/pickup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { data: bookingFetch } = await supabase.from('transport_bookings').select('checkpoints, order_id').eq('id', req.params.id).eq('transporter_id', transporterId).eq('status', 'accepted').single();
    if (!bookingFetch) throw createApiError(404, 'Booking not found');
    
    const checkpoints = bookingFetch.checkpoints || [];
    checkpoints.push({ location: req.body.location || {}, timestamp: new Date(), note: 'Cargo picked up' });

    const { data: booking, error } = await supabase
      .from('transport_bookings')
      .update({ status: 'picked_up', checkpoints })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Update order status
    const { data: order } = await supabase.from('orders').select('*').eq('id', booking.order_id).single();
    if (order) {
      const timeline = order.timeline || [];
      timeline.push({ status: 'pickup', label: 'Cargo Picked Up', timestamp: new Date(), actor: req.user!.id, actorRole: 'transport' });
      await supabase.from('orders').update({ status: 'pickup', timeline }).eq('id', booking.order_id);
    }

    res.json({ success: true, message: 'Pickup confirmed', data: mapKeys({ booking }) });
  } catch (err) { next(err); }
});

// PATCH /api/transport/bookings/:id/deliver
router.patch('/bookings/:id/deliver', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const { data: bookingFetch } = await supabase.from('transport_bookings').select('*').eq('id', req.params.id).eq('transporter_id', transporterId).in('status', ['picked_up', 'in_transit']).single();
    if (!bookingFetch) throw createApiError(404, 'Booking not found');

    const { data: booking, error } = await supabase
      .from('transport_bookings')
      .update({ status: 'delivered', actual_delivery: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Release vehicle
    await supabase.from('vehicles').update({ status: 'available' }).eq('id', booking.vehicle_id);

    // Update order status
    const { data: order } = await supabase.from('orders').select('*').eq('id', booking.order_id).single();
    if (order) {
      const timeline = order.timeline || [];
      timeline.push({ status: 'delivered', label: 'Delivered Successfully', timestamp: new Date(), actor: req.user!.id, actorRole: 'transport' });
      await supabase.from('orders').update({ status: 'delivered', timeline }).eq('id', booking.order_id);
    }

    res.json({ success: true, message: 'Delivery confirmed', data: mapKeys({ booking }) });
  } catch (err) { next(err); }
});

// ============================================
// ROUTE OPTIMIZATION (Google Maps)
// ============================================

// POST /api/transport/route
router.post('/route', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { origin, destination } = req.body;
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        units: 'metric',
      },
    });

    if (data.status !== 'OK') throw createApiError(400, 'Route calculation failed');

    const route = data.routes[0];
    const leg = route.legs[0];

    res.json({
      success: true,
      data: mapKeys({
        distance: leg.distance.text,
        distanceValue: leg.distance.value,
        duration: leg.duration.text,
        durationValue: leg.duration.value,
        polyline: route.overview_polyline.points,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      }),
    });
  } catch (err) { next(err); }
});

// ============================================
// FARE CALCULATOR
// ============================================

// POST /api/transport/calculate-fare
router.post('/calculate-fare', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { distanceKm, weightKg, vehicleType } = req.body;

    // Base rate per km by vehicle type (₹)
    const baseRates: Record<string, number> = {
      truck: 25, mini_truck: 18, tractor: 12, tempo: 15, container: 35,
    };
    const baseRate = baseRates[vehicleType] || 20;

    // Weight surcharge (₹ per 100 kg above 500 kg)
    const weightSurcharge = Math.max(0, (weightKg - 500) / 100) * 50;

    // Calculate fare
    const baseFare = distanceKm * baseRate;
    const totalFare = Math.round(baseFare + weightSurcharge);
    const estimatedDeliveryHours = Math.ceil(distanceKm / 50); // avg 50 km/h

    res.json({
      success: true,
      data: mapKeys({ baseFare, weightSurcharge, totalFare, estimatedDeliveryHours, perKmRate: baseRate }),
    });
  } catch (err) { next(err); }
});

// ============================================
// ANALYTICS & EARNINGS
// ============================================

// GET /api/transport/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;
    
    const [
      { count: totalBookings },
      { count: completedBookings },
      { data: vehicles },
      { data: completedBookingsData }
    ] = await Promise.all([
      supabase.from('transport_bookings').select('*', { count: 'exact', head: true }).eq('transporter_id', transporterId),
      supabase.from('transport_bookings').select('*', { count: 'exact', head: true }).eq('transporter_id', transporterId).eq('status', 'delivered'),
      supabase.from('vehicles').select('*').eq('transporter_id', transporterId),
      supabase.from('transport_bookings').select('fare, created_at').eq('transporter_id', transporterId).eq('status', 'delivered')
    ]);

    const monthlyMap: Record<string, { year: number; month: number; earnings: number; trips: number }> = {};
    if (completedBookingsData) {
      completedBookingsData.forEach(b => {
        const d = new Date(b.created_at);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const key = `${y}-${m}`;
        if (!monthlyMap[key]) monthlyMap[key] = { year: y, month: m, earnings: 0, trips: 0 };
        monthlyMap[key].earnings += b.fare || 0;
        monthlyMap[key].trips += 1;
      });
    }
    const monthlyEarnings = Object.values(monthlyMap)
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))
      .slice(0, 12)
      .map(m => ({ _id: { year: m.year, month: m.month }, earnings: m.earnings, trips: m.trips }));

    const totalEarnings = monthlyEarnings.reduce((sum, m) => sum + m.earnings, 0);

    res.json({
      success: true,
      data: mapKeys({ overview: { totalBookings: totalBookings || 0, completedBookings: completedBookings || 0, totalVehicles: vehicles?.length || 0, totalEarnings }, monthlyEarnings }),
    });
  } catch (err) { next(err); }
});

// GET /api/transport/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    const transporterId = transporter.id;

    const [
      { data: vehicles },
      { data: pendingBookings },
      { data: activeBookings }
    ] = await Promise.all([
      supabase.from('vehicles').select('*').eq('transporter_id', transporterId),
      supabase.from('transport_bookings').select('*, farmer:users!farmer_id(name, phone)').eq('status', 'requested').limit(5),
      supabase.from('transport_bookings').select('*, farmer:users!farmer_id(name, phone)').eq('transporter_id', transporterId).in('status', ['accepted', 'picked_up', 'in_transit']).limit(5)
    ]);

    res.json({ success: true, data: mapKeys({ vehicles, pendingBookings, activeBookings }) });
  } catch (err) { next(err); }
});

// ============================================
// FLEET & DRIVERS (PART 2)
// ============================================

// GET /api/transport/drivers
router.get('/drivers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: transporter } = await supabase.from('transporters').select('id').eq('user_id', req.user!.id).single();
    if (!transporter) throw createApiError(404, 'Transporter profile not found');
    
    // In our simplified setup, we might just query users with role='transport' linked to this transporter, 
    // or just return mock drivers if a dedicated driver auth flow isn't set up yet.
    // For now, we'll return mock data.
    res.json({
      success: true,
      data: {
        drivers: [
          { id: '1', name: 'Ramesh Singh', phone: '+91 9876543210', status: 'available', rating: 4.8, trips: 120, vehicleAssigned: 'DL-1T-4567' },
          { id: '2', name: 'Suresh Kumar', phone: '+91 9876543211', status: 'on_trip', rating: 4.5, trips: 85, vehicleAssigned: 'MH-12-AB-1234' },
          { id: '3', name: 'Ali Khan', phone: '+91 9876543212', status: 'off_duty', rating: 4.9, trips: 210, vehicleAssigned: null },
        ]
      }
    });
  } catch (err) { next(err); }
});

// GET /api/transport/fleet/maintenance
router.get('/fleet/maintenance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        records: [
          { id: '1', vehicleId: 'veh_1', vehicleNumber: 'DL-1T-4567', type: 'Routine Service', cost: 5000, date: '2026-07-15', status: 'completed' },
          { id: '2', vehicleId: 'veh_2', vehicleNumber: 'MH-12-AB-1234', type: 'Tire Replacement', cost: 12000, date: '2026-07-28', status: 'pending' }
        ]
      }
    });
  } catch (err) { next(err); }
});

// POST /api/transport/logistics/payments/settle
router.post('/logistics/payments/settle', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId, amount } = req.body;
    
    // Simulate successful payment settlement
    res.json({
      success: true,
      message: 'Payment settled successfully',
      data: {
        transactionId: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
        amount,
        status: 'settled',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) { next(err); }
});

export default router;
