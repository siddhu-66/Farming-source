import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';

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

router.use(authenticate, authorizeRole('industry'));

// ============================================
// WASTE MARKETPLACE
// ============================================

// GET /api/industry/marketplace
router.get('/marketplace', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, state, wasteType, minPrice, maxPrice } = req.query;

    let query = supabase.from('listings').select('*, farmer_id:users!listings_seller_id_fkey(full_name, avatar_url, phone)', { count: 'exact' });
    query = query.eq('status', 'active').eq('listing_type', 'waste');
    
    if (search) query = query.ilike('title', `%${search}%`);
    if (state) query = query.eq('address->>state', state);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: listings, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: mapKeys({ listings, ...buildPaginationResponse(total || 0, page, limit) }) });
  } catch (err) { next(err); }
});

// POST /api/industry/offers — Make offer on waste listing
router.post('/offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const schema = z.object({
      listingId: z.string(),
      offeredPrice: z.number().min(0),
      quantity: z.number().min(0),
      message: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const { data: listing, error: listingErr } = await supabase.from('listings').select('*').eq('id', data.listingId).single();
    if (listingErr || !listing || listing.status !== 'active') throw createApiError(404, 'Listing not available');

    const newOffer = {
      listing_id: data.listingId,
      offer_price: data.offeredPrice,
      quantity: data.quantity,
      message: data.message,
      industry_id: industryId,
      farmer_id: listing.farmer_id,
      status: 'pending',
      history: [{ action: 'offered', price: data.offeredPrice, by: req.user!.id, at: new Date().toISOString() }],
    };

    const { data: offer, error } = await supabase.from('offers').insert([newOffer]).select().single();
    if (error) throw createApiError(500, error.message);

    const io = (req as any).io;
    if (io) {
      io.to(`user_${listing.farmer_id}`).emit('notification', {
        type: 'offer_received',
        title: 'New Industry Offer!',
        message: `An industry buyer offered ₹${data.offeredPrice}/unit for your waste listing`,
      });
    }

    res.status(201).json({ success: true, message: 'Offer placed', data: mapKeys({ offer }) });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// GET /api/industry/offers
router.get('/offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const { data: offers, error } = await supabase.from('offers')
      .select('*, listing_id:listings!listing_id(crop_name, price), farmer_id:users!offers_farmer_id_fkey(full_name, avatar_url, phone)')
      .eq('industry_id', industryId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ offers }) });
  } catch (err) { next(err); }
});

// GET /api/industry/contracts
router.get('/contracts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const { data: contracts, error } = await supabase.from('contracts')
      .select('*, farmer_id:users!contracts_farmer_id_fkey(full_name, email, phone)')
      .eq('industry_id', industryId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ contracts }) });
  } catch (err) { next(err); }
});

// PATCH /api/industry/contracts/:id/sign
router.patch('/contracts/:id/sign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const { data: contract, error: findErr } = await supabase.from('contracts')
      .select('*')
      .eq('id', req.params.id)
      .eq('industry_id', industryId)
      .single();
      
    if (findErr || !contract) throw createApiError(404, 'Contract not found');

    const signatures = contract.signatures || {};
    signatures.industry = { signedAt: new Date().toISOString(), ipAddress: req.ip };

    const { data: updatedContract, error: updateErr } = await supabase.from('contracts')
      .update({ signatures })
      .eq('id', contract.id)
      .select()
      .single();
      
    if (updateErr) throw createApiError(500, updateErr.message);

    res.json({ success: true, message: 'Contract signed', data: mapKeys({ contract: updatedContract }) });
  } catch (err) { next(err); }
});

// GET /api/industry/orders
router.get('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const { data: orders, error } = await supabase.from('orders')
      .select('*, contract_id:contracts!contract_id(*), farmer_id:users!orders_farmer_id_fkey(full_name, phone)')
      .eq('industry_id', industryId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ orders }) });
  } catch (err) { next(err); }
});

// PATCH /api/industry/orders/:id/quality-check
router.patch('/orders/:id/quality-check', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const { grade, notes, passed } = req.body;
    
    const { data: order, error: findErr } = await supabase.from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('industry_id', industryId)
      .single();
      
    if (findErr || !order) throw createApiError(404, 'Order not found');

    const timeline = order.timeline || [];
    timeline.push({
      status: passed ? 'quality_check' : 'disputed',
      label: passed ? `Quality Check Passed — Grade ${grade}` : 'Quality Check Failed',
      timestamp: new Date().toISOString(),
      actor: req.user!.id,
      actorRole: 'industry',
    });

    const { data: updatedOrder, error: updateErr } = await supabase.from('orders')
      .update({
        quality_grade: grade,
        quality_notes: notes,
        quality_inspected_at: new Date().toISOString(),
        status: passed ? 'transport_booked' : 'disputed',
        timeline,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateErr) throw createApiError(500, updateErr.message);
    res.json({ success: true, message: `Quality ${passed ? 'approved' : 'rejected'}`, data: mapKeys({ order: updatedOrder }) });
  } catch (err) { next(err); }
});

// ============================================
// SUSTAINABILITY METRICS
// ============================================

// GET /api/industry/sustainability
router.get('/sustainability', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    // Fetch all completed orders for this industry to calculate waste processed
    const { data: orders } = await supabase.from('orders')
      .select('contract_id:contracts!contract_id(quantity)')
      .eq('industry_id', industryId)
      .eq('status', 'completed');
      
    let totalWaste = 0;
    let totalOrdersCount = 0;
    
    if (orders) {
      for (const order of orders) {
        if (order.contract_id && typeof (order.contract_id as any).quantity === 'number') {
          totalWaste += (order.contract_id as any).quantity;
        }
        totalOrdersCount++;
      }
    }

    const carbonSaved = (totalWaste * 0.5).toFixed(2); // 0.5 kg CO2 per kg waste diverted

    res.json({
      success: true,
      data: mapKeys({
        totalWasteProcessedKg: totalWaste,
        carbonFootprintSavedKg: carbonSaved,
        totalOrders: totalOrdersCount,
        circularEconomyScore: Math.min(100, Math.round(totalWaste / 1000)),
      }),
    });
  } catch (err) { next(err); }
});

// GET /api/industry/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: industryUser } = await supabase.from('industries').select('id').eq('user_id', req.user!.id).single();
    if (!industryUser) throw createApiError(404, 'Industry profile not found');
    const industryId = industryUser.id;

    const [
      { data: recentOffers },
      { data: activeContracts },
      { data: recentOrders },
      { count: completedOrdersCount },
    ] = await Promise.all([
      supabase.from('offers').select('*, listing_id:listings!listing_id(crop_name), farmer_id:users!offers_farmer_id_fkey(full_name, avatar_url)').eq('industry_id', industryId).order('created_at', { ascending: false }).limit(5),
      supabase.from('contracts').select('*, farmer_id:users!contracts_farmer_id_fkey(full_name, phone)').eq('industry_id', industryId).in('status', ['signed', 'active']).limit(5),
      supabase.from('orders').select('*, contract_id:contracts!contract_id(*)').eq('industry_id', industryId).order('updated_at', { ascending: false }).limit(5),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('industry_id', industryId).eq('status', 'completed'),
    ]);

    res.json({ 
      success: true, 
      data: mapKeys({ 
        recentOffers: recentOffers || [], 
        activeContracts: activeContracts || [], 
        recentOrders: recentOrders || [], 
        completedOrders: completedOrdersCount || 0 
      }) 
    });
  } catch (err) { next(err); }
});

export default router;
