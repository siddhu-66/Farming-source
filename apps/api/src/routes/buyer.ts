import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
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

router.use(authenticate, authorizeRole('buyer'));

router.use(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: buyer, error } = await supabase.from('buyers').select('id').eq('user_id', req.user!.id).single();
    if (error || !buyer) return next(createApiError(404, 'Buyer profile not found'));
    (req as any).buyerId = buyer.id;
    next();
  } catch (err) { next(err); }
});

// ============================================
// MARKETPLACE BROWSING
// ============================================

// GET /api/buyer/marketplace
router.get('/marketplace', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, minPrice, maxPrice, state, organicOnly, cropName, minQty, sortBy } = req.query;

    let query = supabase.from('listings').select('*, farmer_id:users!farmer_id(name, avatar, address)', { count: 'exact' });
    query = query.eq('status', 'active').eq('type', 'crop');

    // Simple textual search in Supabase using ilike
    if (search) query = query.ilike('title', `%${search}%`);
    if (state) query = query.eq('address->>state', state);
    if (organicOnly === 'true') query = query.eq('organic_certified', true);
    if (cropName) query = query.ilike('crop_name', `%${cropName}%`);
    if (minPrice) query = query.gte('price_per_unit', Number(minPrice));
    if (maxPrice) query = query.lte('price_per_unit', Number(maxPrice));
    if (minQty) query = query.gte('quantity', Number(minQty));

    if (sortBy === 'price_asc') {
      query = query.order('price_per_unit', { ascending: true });
    } else if (sortBy === 'price_desc') {
      query = query.order('price_per_unit', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('views', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(skip, skip + limit - 1);

    const { data: listings, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    // N+1 Query removed: Incrementing views on a GET request should be handled asynchronously or via an RPC.

    res.json({ success: true, data: { listings: toCamel(listings), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// GET /api/buyer/marketplace/:id — Single listing detail
router.get('/marketplace/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: listing, error } = await supabase.from('listings')
      .select('*, farmer_id:users!farmer_id(name, avatar, address, phone, created_at)')
      .eq('id', req.params.id)
      .single();
    
    if (error || !listing || listing.status === 'cancelled') throw createApiError(404, 'Listing not found');
    
    await supabase.from('listings').update({ views: (listing.views || 0) + 1 }).eq('id', req.params.id);
    
    res.json({ success: true, data: { listing: toCamel(listing) } });
  } catch (err) { next(err); }
});

// ============================================
// OFFERS
// ============================================

// POST /api/buyer/offers — Make an offer
router.post('/offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      listingId: z.string(),
      offeredPrice: z.number().min(0),
      quantity: z.number().min(0),
      message: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const { data: listing, error: listingErr } = await supabase.from('listings').select('*').eq('id', data.listingId).single();
    if (listingErr || !listing || listing.status !== 'active') throw createApiError(404, 'Listing not available');
    if (data.quantity < listing.minOrderQuantity) {
      throw createApiError(400, `Minimum order quantity is ${listing.minOrderQuantity} ${listing.unit}`);
    }

    // Check for existing offer
    const { data: existingOffer } = await supabase.from('offers')
      .select('*')
      .eq('listing_id', data.listingId)
      .eq('buyer_id', (req as any).buyerId)
      .in('status', ['pending', 'counter'])
      .maybeSingle();

    if (existingOffer) throw createApiError(409, 'You already have an active offer on this listing');

    const newOffer = {
      ...toSnake(data),
      buyer_id: (req as any).buyerId,
      farmer_id: listing.farmer_id,
      status: 'pending',
      history: [{ action: 'offered', price: data.offeredPrice, by: req.user!.id, at: new Date().toISOString() }],
    };

    const { data: offer, error: offerErr } = await supabase.from('offers').insert([newOffer]).select().single();
    if (offerErr) throw createApiError(500, offerErr.message);

    // Notify farmer via Socket.IO
    const io = (req as any).io;
    if (io) {
      io.to(`user_${listing.farmer_id}`).emit('notification', {
        type: 'offer_received',
        title: 'New Offer Received!',
        message: `You received an offer of ₹${data.offeredPrice}/unit for ${listing.title}`,
      });
    }

    res.status(201).json({ success: true, message: 'Offer placed successfully', data: { offer: toCamel(offer) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// GET /api/buyer/offers
router.get('/offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: offers, error } = await supabase.from('offers')
      .select('*, listing_id:listings!listing_id(title, crop_name, price_per_unit, images), farmer_id:users!farmer_id(name, avatar, phone)')
      .eq('buyer_id', (req as any).buyerId)
      .order('created_at', { ascending: false });
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { offers: toCamel(offers) } });
  } catch (err) { next(err); }
});

// PATCH /api/buyer/offers/:id/accept-counter — Accept farmer's counter offer
router.patch('/offers/:id/accept-counter', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: offer, error: findErr } = await supabase.from('offers')
      .select('*')
      .eq('id', req.params.id)
      .eq('buyer_id', (req as any).buyerId)
      .eq('status', 'counter')
      .single();
      
    if (findErr || !offer) throw createApiError(404, 'Counter offer not found');

    const updatedHistory = [
      ...(offer.history || []),
      { action: 'counter_accepted', price: offer.counter_price, by: req.user!.id, at: new Date().toISOString() }
    ];

    const { data: updatedOffer, error: updateErr } = await supabase.from('offers')
      .update({
        offered_price: offer.counter_price,
        status: 'accepted',
        history: updatedHistory
      })
      .eq('id', offer.id)
      .select()
      .single();
      
    if (updateErr) throw createApiError(500, updateErr.message);

    res.json({ success: true, message: 'Counter offer accepted', data: { offer: toCamel(updatedOffer) } });
  } catch (err) { next(err); }
});

// PATCH /api/buyer/offers/:id/withdraw
router.patch('/offers/:id/withdraw', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: offer, error } = await supabase.from('offers')
      .update({ status: 'withdrawn' })
      .eq('id', req.params.id)
      .eq('buyer_id', (req as any).buyerId)
      .in('status', ['pending', 'counter'])
      .select()
      .single();
      
    if (error || !offer) throw createApiError(404, 'Offer not found');
    res.json({ success: true, message: 'Offer withdrawn', data: { offer: toCamel(offer) } });
  } catch (err) { next(err); }
});

// ============================================
// CONTRACTS
// ============================================

// GET /api/buyer/contracts
router.get('/contracts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: contracts, error } = await supabase.from('contracts')
      .select('*, farmer_id:users!farmer_id(name, email, phone, avatar, address), listing_id:listings!listing_id(title, crop_name)')
      .eq('buyer_id', (req as any).buyerId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { contracts: toCamel(contracts) } });
  } catch (err) { next(err); }
});

// PATCH /api/buyer/contracts/:id/sign
router.patch('/contracts/:id/sign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: contract, error: findErr } = await supabase.from('contracts')
      .select('*')
      .eq('id', req.params.id)
      .eq('buyer_id', (req as any).buyerId)
      .single();
      
    if (findErr || !contract) throw createApiError(404, 'Contract not found');
    if (contract.status === 'signed' && contract.signatures?.buyer?.signedAt) {
      throw createApiError(400, 'Already signed');
    }

    const signatures = contract.signatures || {};
    signatures.buyer = { signedAt: new Date().toISOString(), ipAddress: req.ip };

    const { error: updateErr } = await supabase.from('contracts')
      .update({ signatures })
      .eq('id', contract.id);
      
    if (updateErr) throw createApiError(500, updateErr.message);

    res.json({ success: true, message: 'Contract signed' });
  } catch (err) { next(err); }
});

// ============================================
// ORDERS
// ============================================

// GET /api/buyer/orders
router.get('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    
    const { data: orders, count: total, error } = await supabase.from('orders')
      .select('*, contract_id:contracts!contract_id(*), farmer_id:users!farmer_id(name, phone)', { count: 'exact' })
      .eq('buyer_id', (req as any).buyerId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { orders: toCamel(orders), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// ============================================
// ANALYTICS
// ============================================

// GET /api/buyer/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).buyerId;
    
    const [
      { count: totalOffers },
      { count: activeContracts },
      { count: completedOrders },
      { count: pendingOrders },
    ] = await Promise.all([
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('buyer_id', buyerId),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('buyer_id', buyerId).in('status', ['signed', 'active']),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyerId).eq('status', 'completed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyerId).not('status', 'in', '("completed","cancelled")'),
    ]);

    res.json({
      success: true,
      data: {
        overview: { 
          totalOffers: totalOffers || 0, 
          activeContracts: activeContracts || 0, 
          completedOrders: completedOrders || 0, 
          pendingOrders: pendingOrders || 0 
        },
        monthlySpend: [], // Needs RPC or complex aggregation
      },
    });
  } catch (err) { next(err); }
});

// GET /api/buyer/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).buyerId;
    const [
      { data: recentOffers },
      { data: activeContracts },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('offers').select('*, listing_id:listings!listing_id(title, crop_name, price_per_unit, images), farmer_id:users!farmer_id(name, avatar)').eq('buyer_id', buyerId).order('created_at', { ascending: false }).limit(5),
      supabase.from('contracts').select('*, farmer_id:users!farmer_id(name, phone)').eq('buyer_id', buyerId).in('status', ['signed', 'active']).limit(5),
      supabase.from('orders').select('*, contract_id:contracts!contract_id(*)').eq('buyer_id', buyerId).order('updated_at', { ascending: false }).limit(5),
    ]);

    res.json({ success: true, data: { recentOffers: toCamel(recentOffers) || [], activeContracts: toCamel(activeContracts) || [], recentOrders: toCamel(recentOrders) || [] } });
  } catch (err) { next(err); }
});

export default router;
