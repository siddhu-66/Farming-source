import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { z } from 'zod';
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

router.use(authenticate);

// GET /api/marketplace — Public listings (all roles can view)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { type, search, category, district, state, organic, minPrice, maxPrice, grade, sortBy } = req.query;

    let query = supabase.from('listings').select('*, farmer_id:users!listings_seller_id_fkey(full_name, avatar_url, verified)', { count: 'exact' }).in('status', ['active', 'auction']);
    
    if (type) query = query.eq('listing_type', type);
    if (search) query = query.ilike('crop_name', `%${search}%`); // Simplification for text search
    if (category) query = query.eq('category', category);
    if (district) query = query.eq('address->>district', district);
    if (state) query = query.eq('address->>state', state);
    if (organic === 'true') query = query.eq('organic_certified', true);
    if (grade) query = query.eq('quality_grade', grade);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    const sortMap: Record<string, { column: string, ascending: boolean }> = {
      newest: { column: 'created_at', ascending: false },
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      popular: { column: 'views', ascending: false },
      relevance: { column: 'created_at', ascending: false },
    };
    const sort = sortMap[sortBy as string] || sortMap.newest;
    
    const { data: listings, count: total, error } = await query
      .order(sort.column, { ascending: sort.ascending })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    res.json({ success: true, data: { listings: toCamel(listings), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// GET /api/marketplace/search — Autocomplete Search
router.get('/search', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.query;
    if (!keyword || (keyword as string).length < 2) {
      res.json({ success: true, data: { suggestions: [] } });
      return;
    }

    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, crop_name, category, address')
      .in('status', ['active', 'auction'])
      .ilike('crop_name', `%${keyword}%`)
      .limit(5);

    if (error) throw error;
    res.json({ success: true, data: { suggestions: toCamel(listings) } });
  } catch (err) { next(err); }
});

// GET /api/marketplace/price-suggestion
router.get('/price-suggestion', async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { cropName, grade, quantity } = req.query;
    if (!cropName) throw createApiError(400, 'Crop name is required');

    // MOCK AI Price suggestion based on input
    const basePrice = Math.floor(Math.random() * 50) + 20; // 20 to 70
    let multiplier = 1;
    if (grade === 'Premium') multiplier = 1.5;
    else if (grade === 'Grade A') multiplier = 1.2;
    else if (grade === 'Grade C') multiplier = 0.8;

    const suggestedPrice = Math.round(basePrice * multiplier);
    const minAcceptablePrice = Math.round(suggestedPrice * 0.85);
    const premiumOpportunity = Math.round(suggestedPrice * 1.15);

    res.json({
      success: true,
      data: {
        suggestedPrice,
        minAcceptablePrice,
        premiumOpportunity,
        marketTrend: ['Upward', 'Stable', 'Downward'][Math.floor(Math.random() * 3)],
        confidenceScore: Math.floor(Math.random() * 20) + 80 // 80 to 100
      }
    });
  } catch (err) { next(err); }
});

// GET /api/marketplace/buyers
router.get('/buyers', async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { cropName, distance, verified } = req.query;

    // We'll mock the buyer discovery from the 'users' and 'buyers' table
    let query = supabase
      .from('users')
      .select('*, buyer_profile:buyers(business_type, rating, total_purchases, preferred_crops)', { count: 'exact' })
      .eq('role', 'buyer');

    if (verified === 'true') {
      query = query.eq('is_verified', true);
    }

    const { data: buyersData, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Filter by preferred crops locally for mock simplicity if needed
    let filteredBuyers = buyersData || [];
    if (cropName) {
      filteredBuyers = filteredBuyers.filter(b => {
        const preferred = b.buyer_profile?.[0]?.preferred_crops || [];
        // If they have no preferred crops listed, maybe they buy anything, or we just skip. Let's include if empty or matches
        if (preferred.length === 0) return true;
        return preferred.some((p: string) => p.toLowerCase().includes((cropName as string).toLowerCase()));
      });
    }

    res.json({
      success: true,
      data: {
        buyers: toCamel(filteredBuyers),
        ...buildPaginationResponse(total || 0, page, limit)
      }
    });
  } catch (err) { next(err); }
});

// POST /api/marketplace/save
router.post('/save', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.body;
    if (!listingId) throw createApiError(400, 'Listing ID required');

    const { error } = await supabase.from('saved_listings').insert([{
      user_id: req.user!.id,
      listing_id: listingId
    }]);

    if (error) throw error;
    res.json({ success: true, message: 'Listing saved' });
  } catch (err) { next(err); }
});

// DELETE /api/marketplace/save/:id
router.delete('/save/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('listing_id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Listing removed from saved' });
  } catch (err) { next(err); }
});

// POST /api/marketplace/bids
router.post('/bids', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      listingId: z.string(),
      offerPrice: z.number().positive(),
      quantity: z.number().positive(),
    });
    const data = schema.parse(req.body);

    const { data: offer, error } = await supabase.from('offers').insert([{
      listing_id: data.listingId,
      buyer_id: req.user!.id,
      offer_price: data.offerPrice,
      quantity: data.quantity,
      status: 'pending'
    }]).select().single();

    if (error) throw error;

    // Emit event
    (req as any).io.emit('bid:received', toCamel(offer));

    res.status(201).json({ success: true, message: 'Bid placed successfully', data: { offer: toCamel(offer) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// POST /api/marketplace/reports
router.post('/reports', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      listingId: z.string(),
      reason: z.string().min(5)
    });
    const data = schema.parse(req.body);

    const { error } = await supabase.from('reports').insert([{
      reporter_id: req.user!.id,
      listing_id: data.listingId,
      reason: data.reason,
      status: 'pending'
    }]);

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Listing reported to moderation queue' });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// GET /api/marketplace/similar/:id
router.get('/similar/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: currentListing } = await supabase.from('listings').select('crop_name, category').eq('id', req.params.id).single();
    if (!currentListing) throw createApiError(404, 'Listing not found');

    const { data: similar, error } = await supabase
      .from('listings')
      .select('*, farmer_id:users!listings_seller_id_fkey(full_name, avatar_url, verified)')
      .neq('id', req.params.id)
      .eq('category', currentListing.category)
      .in('status', ['active', 'auction'])
      .limit(4);

    if (error) throw error;
    res.json({ success: true, data: { similar: toCamel(similar) } });
  } catch (err) { next(err); }
});

// GET /api/marketplace/:id — Single listing
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: currentListing } = await supabase.from('listings').select('views').eq('id', req.params.id).single();
    if (!currentListing) throw createApiError(404, 'Listing not found');

    const { data: listing, error } = await supabase
      .from('listings')
      .update({ views: (currentListing.views || 0) + 1 })
      .eq('id', req.params.id)
      .select('*, farmer_id:users!listings_seller_id_fkey(full_name, avatar_url, phone, verified, created_at)')
      .single();

    if (error || !listing) throw createApiError(404, 'Listing not found');
    res.json({ success: true, data: { listing: toCamel(listing) } });
  } catch (err) { next(err); }
});

// POST /api/marketplace/contract — Create contract from accepted offer
router.post('/contract', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      offerId: z.string(),
      deliveryDate: z.string().transform(d => new Date(d)),
      deliveryAddress: z.object({
        street: z.string().optional(),
        village: z.string().optional(),
        district: z.string().optional(),
        state: z.string(),
        pincode: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      }),
      terms: z.string().min(20),
      qualityTerms: z.string().optional(),
      paymentTerms: z.string().default('Payment upon delivery'),
    });
    const data = schema.parse(req.body);

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*, listing_id:listings(*)')
      .eq('id', data.offerId)
      .single();
      
    if (offerError || !offer || offer.status !== 'accepted') throw createApiError(400, 'Offer not in accepted state');

    const listing = offer.listing_id as any;
    const { data: contract, error: contractError } = await supabase.from('contracts').insert([{
      offer_id: offer.id,
      listing_id: listing.id,
      farmer_id: offer.farmer_id,
      buyer_id: offer.buyer_id,
      industry_id: offer.industry_id,
      title: `Contract for ${listing.title}`,
      quantity: offer.quantity,
      unit: listing.unit,
      price_per_unit: offer.offer_price,
      total_amount: offer.quantity * offer.offer_price,
      delivery_date: data.deliveryDate.toISOString(),
      delivery_address: data.deliveryAddress,
      terms: data.terms,
      quality_terms: data.qualityTerms,
      payment_terms: data.paymentTerms,
      status: 'draft',
    }]).select().single();

    if (contractError) throw contractError;

    res.status(201).json({ success: true, message: 'Contract created', data: { contract: toCamel(contract) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// POST /api/marketplace/payment — Record a payment
router.post('/payment', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      orderId: z.string(),
      contractId: z.string(),
      receivedById: z.string(),
      amount: z.number().min(0),
      method: z.enum(['cash', 'upi', 'bank_transfer']),
      transactionId: z.string().optional(),
      note: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const { data: payment, error: paymentError } = await supabase.from('payments').insert([{
      ...toSnake(data),
      paid_by: req.user!.id,
      received_by: data.receivedById,
      status: 'completed',
      paid_at: new Date().toISOString(),
    }]).select().single();

    if (paymentError) throw paymentError;

    // Update order paid amount
    const { data: order } = await supabase.from('orders').select('*').eq('id', data.orderId).single();
    if (order) {
      const newPaidAmount = (order.paid_amount || 0) + data.amount;
      const timeline = order.timeline || [];
      
      let updateData: any = { paid_amount: newPaidAmount };
      if (newPaidAmount >= order.total_amount) {
        updateData.payment_status = 'completed';
        updateData.status = 'payment_done';
        timeline.push({
          status: 'payment_done',
          label: `Payment received — ₹${data.amount} via ${data.method}`,
          timestamp: new Date().toISOString(),
          actor: req.user!.id,
          actorRole: req.user!.role,
        });
        updateData.timeline = timeline;
      } else {
        updateData.payment_status = 'partial';
      }
      
      await supabase.from('orders').update(updateData).eq('id', data.orderId);
    }

    res.status(201).json({ success: true, message: 'Payment recorded', data: { payment: toCamel(payment) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// GET /api/marketplace/order/:id — Order with full timeline
router.get('/order/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, contract_id:contracts(*), farmer_id:users!orders_farmer_id_fkey(full_name, phone, avatar_url), buyer_id:users!orders_buyer_id_fkey(full_name, phone, avatar_url), industry_id:users!orders_industry_id_fkey(full_name, phone, avatar_url), transport_id:users!orders_transport_id_fkey(full_name, phone, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (error || !order) throw createApiError(404, 'Order not found');
    res.json({ success: true, data: { order: toCamel(order) } });
  } catch (err) { next(err); }
});

// PATCH /api/marketplace/order/:id/status
router.patch('/order/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, note } = req.body;
    
    const { data: existingOrder } = await supabase.from('orders').select('timeline').eq('id', req.params.id).single();
    if (!existingOrder) throw createApiError(404, 'Order not found');
    
    const timeline = existingOrder.timeline || [];
    timeline.push({
      status,
      label: status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      timestamp: new Date().toISOString(),
      note,
      actor: req.user!.id,
      actorRole: req.user!.role,
    });

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        timeline
      })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error || !order) throw createApiError(404, 'Order not found');
    res.json({ success: true, message: 'Status updated', data: { order: toCamel(order) } });
  } catch (err) { next(err); }
});

export default router;
