import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';

const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => toCamel(v));
  if (obj !== null && obj !== undefined && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => toSnake(v));
  if (obj !== null && obj !== undefined && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

const router = Router();

// All order routes require authentication
router.use(authenticate);

// ============================================
// CREATE ORDER
// ============================================
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      listingId: z.string(),
      quantity: z.number().min(1),
    });
    const { listingId, quantity } = schema.parse(req.body);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Fetch listing to verify stock
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingErr || !listing) throw createApiError(404, 'Listing not found');
    if (!['active', 'auction'].includes(listing.status)) {
      throw createApiError(400, 'Listing is not active');
    }
    if (listing.quantity < quantity) {
      throw createApiError(400, 'Insufficient stock');
    }

    // Determine the buyer record ID based on role
    let buyerRecordId = null;
    let industryRecordId = null;
    if (userRole === 'buyer') {
      const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', userId).single();
      buyerRecordId = buyer?.id;
    } else if (userRole === 'industry') {
      const { data: industry } = await supabase.from('industries').select('id').eq('user_id', userId).single();
      industryRecordId = industry?.id;
    }

    if (!buyerRecordId && !industryRecordId) {
      throw createApiError(403, 'User is not a valid buyer or industry entity');
    }

    const totalAmount = quantity * listing.price_per_unit;

    const newOrder = {
      farmer_id: listing.farmer_id,
      buyer_id: buyerRecordId,
      industry_id: industryRecordId,
      listing_id: listing.id,
      total_amount: totalAmount,
      status: 'pending_farmer',
      timeline: [{
        status: 'created',
        label: 'Order Created',
        timestamp: new Date().toISOString(),
        actor: userId,
        actorRole: userRole,
      }],
    };

    // Use transaction/rpc or sequential updates
    const { data: order, error: orderErr } = await supabase.from('orders').insert([newOrder]).select().single();
    if (orderErr) throw createApiError(500, orderErr.message);

    // Decrement inventory (reserve it)
    await supabase.from('listings').update({ quantity: listing.quantity - quantity }).eq('id', listingId);

    // Notify farmer via Socket.IO
    const io = (req as any).io;
    if (io) {
      // Find user_id of the farmer to send notification
      const { data: farmerUser } = await supabase.from('farmers').select('user_id').eq('id', listing.farmer_id).single();
      if (farmerUser) {
        io.to(`user_${farmerUser.user_id}`).emit('order:created', toCamel(order));
      }
    }

    res.status(201).json({ success: true, message: 'Order created successfully', data: { order: toCamel(order) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// GET ORDERS
// ============================================
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = supabase.from('orders').select('*, listing:listings(crop_name, images, price_per_unit, unit)', { count: 'exact' });

    // Filter by role
    if (role === 'farmer') {
      const { data: f } = await supabase.from('farmers').select('id').eq('user_id', userId).single();
      query = query.eq('farmer_id', f?.id);
    } else if (role === 'buyer') {
      const { data: b } = await supabase.from('buyers').select('id').eq('user_id', userId).single();
      query = query.eq('buyer_id', b?.id);
    } else if (role === 'industry') {
      const { data: ind } = await supabase.from('industries').select('id').eq('user_id', userId).single();
      query = query.eq('industry_id', ind?.id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: orders, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: { orders: toCamel(orders), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// ============================================
// GET ORDER DETAILS
// ============================================
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: order, error } = await supabase.from('orders')
      .select('*, listing:listings(crop_name, images, price_per_unit, unit), farmer:farmers(user_id), buyer:buyers(user_id)')
      .eq('id', req.params.id)
      .single();
      
    if (error || !order) throw createApiError(404, 'Order not found');
    
    res.json({ success: true, data: { order: toCamel(order) } });
  } catch (err) { next(err); }
});

// ============================================
// FARMER CONFIRM ORDER
// ============================================
router.patch('/:id/confirm', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { data: f } = await supabase.from('farmers').select('id').eq('user_id', userId).single();
    
    const { data: order, error: orderErr } = await supabase.from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', f?.id)
      .single();
      
    if (orderErr || !order) throw createApiError(404, 'Order not found or unauthorized');
    if (order.status !== 'pending_farmer') throw createApiError(400, 'Order cannot be confirmed');

    const updatedTimeline = [
      ...(order.timeline || []),
      { status: 'confirmed', label: 'Farmer Confirmed', timestamp: new Date().toISOString(), actor: userId, actorRole: 'farmer' }
    ];

    const { data: updatedOrder, error: updateErr } = await supabase.from('orders')
      .update({ status: 'confirmed', timeline: updatedTimeline })
      .eq('id', order.id)
      .select()
      .single();

    if (updateErr) throw createApiError(500, updateErr.message);

    // Notify Buyer
    const io = (req as any).io;
    if (io && order.buyer_id) {
       const { data: b } = await supabase.from('buyers').select('user_id').eq('id', order.buyer_id).single();
       if (b) io.to(`user_${b.user_id}`).emit('order:confirmed', toCamel(updatedOrder));
    }

    res.json({ success: true, message: 'Order confirmed', data: { order: toCamel(updatedOrder) } });
  } catch (err) { next(err); }
});

// ============================================
// CANCEL ORDER
// ============================================
router.patch('/:id/cancel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;
    
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (orderErr || !order) throw createApiError(404, 'Order not found');
    
    // Auth Check
    let authorized = false;
    if (role === 'farmer') {
      const { data: f } = await supabase.from('farmers').select('id').eq('user_id', userId).single();
      authorized = f?.id === order.farmer_id;
    } else if (role === 'buyer') {
      const { data: b } = await supabase.from('buyers').select('id').eq('user_id', userId).single();
      authorized = b?.id === order.buyer_id;
    } else if (role === 'admin') {
      authorized = true;
    }
    
    if (!authorized) throw createApiError(403, 'Not authorized to cancel this order');
    if (['completed', 'in_transit', 'delivered', 'cancelled'].includes(order.status)) {
       throw createApiError(400, 'Order cannot be cancelled at this stage');
    }

    const updatedTimeline = [
      ...(order.timeline || []),
      { status: 'cancelled', label: 'Order Cancelled', timestamp: new Date().toISOString(), actor: userId, actorRole: role, reason }
    ];

    const { data: updatedOrder, error: updateErr } = await supabase.from('orders')
      .update({ status: 'cancelled', timeline: updatedTimeline })
      .eq('id', order.id)
      .select()
      .single();

    if (updateErr) throw createApiError(500, updateErr.message);

    // Return inventory to listing
    if (order.listing_id) {
        // Calculate original listing quantity. This might require a rpc call in real scenario, but we can do:
        // We actually need the listing's current quantity + order total_amount/price. 
        // Simplification: we don't store quantity directly in order, so we need to infer it.
        const { data: l } = await supabase.from('listings').select('quantity, price_per_unit').eq('id', order.listing_id).single();
        if (l) {
            const qtyReturned = Math.floor(order.total_amount / l.price_per_unit);
            await supabase.from('listings').update({ quantity: l.quantity + qtyReturned }).eq('id', order.listing_id);
        }
    }

    res.json({ success: true, message: 'Order cancelled', data: { order: toCamel(updatedOrder) } });
  } catch (err) { next(err); }
});

export default router;
