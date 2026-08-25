import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import { analyzeListing } from '../services/ai';
import { notifyMatchingBuyers } from '../services/notification';
import { logger } from '../config/logger';

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

// All farmer routes require authentication + farmer role
router.use(authenticate, authorizeRole('farmer'));

router.use(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: farmer, error } = await supabase.from('farmers').select('id').eq('user_id', req.user!.id).single();
    if (error || !farmer) return next(createApiError(404, 'Farmer profile not found'));
    (req as any).farmerId = farmer.id;
    next();
  } catch (err) { next(err); }
});

// ============================================
// PROFILE MANAGEMENT
// ============================================

// GET /api/farmer/profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const farmerId = (req as any).farmerId;

    const [
      { data: user, error: userErr },
      { data: farmer, error: farmerErr },
      { data: addresses, error: addrErr },
      { data: verification, error: verErr }
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('farmers').select('*').eq('id', farmerId).single(),
      supabase.from('addresses').select('*').eq('user_id', userId).is('farm_id', null),
      supabase.from('verification_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
    ]);

    if (userErr) throw createApiError(500, userErr.message);
    if (farmerErr) throw createApiError(500, farmerErr.message);

    res.json({
      success: true,
      data: {
        profile: toCamel({
          ...user,
          ...farmer,
          addresses: addresses || [],
          verification_status: verification?.[0]?.status || 'Draft'
        })
      }
    });
  } catch (err) { next(err); }
});

// PUT /api/farmer/profile
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const farmerId = (req as any).farmerId;

    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      aadhaarNumber: z.string().optional(),
      panNumber: z.string().optional(),
      occupation: z.string().optional(),
      education: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactNumber: z.string().optional(),
      preferredLanguage: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    });

    const data = schema.parse(req.body);

    const userPayload: any = {};
    if (data.firstName || data.lastName) userPayload.full_name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    if (data.dateOfBirth) userPayload.date_of_birth = data.dateOfBirth;
    if (data.gender) userPayload.gender = data.gender;
    if (data.aadhaarNumber) userPayload.aadhaar_number = data.aadhaarNumber;
    if (data.panNumber) userPayload.pan_number = data.panNumber;
    if (data.preferredLanguage) userPayload.language = data.preferredLanguage;
    if (data.phone) userPayload.phone = data.phone;
    if (data.email) userPayload.email = data.email;

    if (Object.keys(userPayload).length > 0) {
      const { error } = await supabase.from('users').update(userPayload).eq('id', userId);
      if (error) throw createApiError(500, error.message);
    }

    const farmerPayload: any = {};
    if (data.occupation) farmerPayload.occupation = data.occupation;
    if (data.education) farmerPayload.education = data.education;
    if (data.emergencyContactName) farmerPayload.emergency_contact_name = data.emergencyContactName;
    if (data.emergencyContactNumber) farmerPayload.emergency_contact_number = data.emergencyContactNumber;

    if (Object.keys(farmerPayload).length > 0) {
      const { error } = await supabase.from('farmers').update(farmerPayload).eq('id', farmerId);
      if (error) throw createApiError(500, error.message);
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// FARM MANAGEMENT
// ============================================

// GET /api/farmer/farms
router.get('/farms', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: farms, error } = await supabase
      .from('farms')
      .select('*, land_parcels(*), soil_reports(*), irrigation_sources(*)')
      .eq('farmer_id', (req as any).farmerId)
      .eq('is_active', true);
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { farms: toCamel(farms) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/farms
router.post('/farms', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      farmCode: z.string().optional(),
      farmType: z.string().optional(),
      totalArea: z.number().min(0.1),
      areaUnit: z.string().optional(),
      ownershipType: z.string().optional(),
      primaryCrop: z.string().optional(),
      irrigationMethod: z.string().optional(),
      soilType: z.string().optional(),
      address: z.object({
        village: z.string().optional(),
        district: z.string().optional(),
        state: z.string(),
        pincode: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      }).optional(),
    });
    
    // We handle nested payload slightly differently to match new schema expectations
    const data = schema.parse(req.body);
    
    // address is historically stored as jsonb in farms table from previous sync
    // the new schema adds it to the addresses table as well, but for simplicity
    // we can save it to the farms jsonb address column and let the frontend use that.

    const { data: farm, error } = await supabase.from('farms').insert([{ 
      ...toSnake(data), 
      farmer_id: (req as any).farmerId 
    }]).select().single();
    
    if (error) throw createApiError(500, error.message);
    res.status(201).json({ success: true, message: 'Farm created successfully', data: { farm: toCamel(farm) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// PUT /api/farmer/farms/:id
router.put('/farms/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: farm, error } = await supabase.from('farms')
      .update(toSnake(req.body))
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .select()
      .single();
    if (error || !farm) throw createApiError(404, 'Farm not found');
    res.json({ success: true, message: 'Farm updated', data: { farm: toCamel(farm) } });
  } catch (err) { next(err); }
});

// DELETE /api/farmer/farms/:id
router.delete('/farms/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.from('farms').update({ is_active: false }).eq('id', req.params.id).eq('farmer_id', (req as any).farmerId);
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, message: 'Farm removed' });
  } catch (err) { next(err); }
});

// ============================================
// LAND PARCELS
// ============================================

// POST /api/farmer/farms/:id/parcels
router.post('/farms/:id/parcels', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      parcelName: z.string().min(2),
      parcelId: z.string().optional(),
      area: z.number().min(0.01),
      gpsCoordinates: z.any().optional(),
      soilType: z.string().optional(),
      elevation: z.number().optional(),
      waterSource: z.string().optional(),
      currentCrop: z.string().optional(),
      status: z.string().optional()
    });
    const data = schema.parse(req.body);
    
    // Verify farm ownership
    const { data: farm, error: farmErr } = await supabase.from('farms').select('id').eq('id', req.params.id).eq('farmer_id', (req as any).farmerId).single();
    if (farmErr || !farm) throw createApiError(404, 'Farm not found');

    const { data: parcel, error } = await supabase.from('land_parcels').insert([{ 
      ...toSnake(data), 
      farm_id: farm.id 
    }]).select().single();
    
    if (error) throw createApiError(500, error.message);
    res.status(201).json({ success: true, message: 'Land parcel added', data: { parcel: toCamel(parcel) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// DOCUMENTS (KYC)
// ============================================

// POST /api/farmer/documents/upload
router.post('/documents/upload', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Note: In a real implementation with multipart/form-data, we'd use multer and upload to Supabase Storage.
    // For this module, we assume the frontend uploads directly to Supabase and sends the URL here, or sends base64.
    // Assuming frontend uploads directly and sends the URL and documentType here:
    const schema = z.object({
      documentType: z.string(),
      fileUrl: z.string().url()
    });
    
    const data = schema.parse(req.body);
    
    const { data: doc, error } = await supabase.from('farmer_documents').insert([{ 
      ...toSnake(data), 
      user_id: req.user!.id,
      verification_status: 'Pending'
    }]).select().single();
    
    if (error) throw createApiError(500, error.message);
    
    // Update verification request status
    await supabase.from('verification_requests').upsert({
      user_id: req.user!.id,
      status: 'Pending',
      submitted_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: { document: toCamel(doc) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// CROP MANAGEMENT
// ============================================

// GET /api/farmer/crops
router.get('/crops', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, farmId } = req.query;
    
    let query = supabase.from('crops').select('*, farm_id:farms!farm_id(name, address)', { count: 'exact' });
    query = query.eq('farmer_id', (req as any).farmerId);
    
    if (status) query = query.eq('status', status);
    if (farmId) query = query.eq('farm_id', farmId);
    
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: crops, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: { crops: toCamel(crops), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/crops
router.post('/crops', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      farmId: z.string(),
      name: z.string().min(2),
      variety: z.string(),
      quantity: z.number().min(0),
      unit: z.enum(['kg', 'quintal', 'ton']),
      plantingDate: z.string().transform(d => new Date(d).toISOString()),
      expectedHarvestDate: z.string().transform(d => new Date(d).toISOString()),
      estimatedPrice: z.number().min(0),
      organicCertified: z.boolean().default(false),
      description: z.string().optional(),
      pesticides: z.array(z.string()).default([]),
      fertilizers: z.array(z.string()).default([]),
    });
    const data = schema.parse(req.body);

    const { data: farm, error: farmErr } = await supabase.from('farms').select('*').eq('id', data.farmId).eq('farmer_id', (req as any).farmerId).single();
    if (farmErr || !farm) throw createApiError(404, 'Farm not found');

    const { data: crop, error: cropErr } = await supabase.from('crops').insert([{ ...toSnake(data), farmer_id: (req as any).farmerId }]).select().single();
    if (cropErr) throw createApiError(500, cropErr.message);
    
    res.status(201).json({ success: true, message: 'Crop added successfully', data: { crop: toCamel(crop) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// PUT /api/farmer/crops/:id
router.put('/crops/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: crop, error } = await supabase.from('crops')
      .update(toSnake(req.body))
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .select()
      .single();
    if (error || !crop) throw createApiError(404, 'Crop not found');
    res.json({ success: true, message: 'Crop updated', data: { crop: toCamel(crop) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/crops/:id/harvest
router.patch('/crops/:id/harvest', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { actualQuantity, actualPrice, qualityNotes } = req.body;
    
    const updateData: any = {
      status: 'harvested',
      actual_harvest_date: new Date().toISOString(),
    };
    if (actualQuantity) updateData.quantity = actualQuantity;
    if (actualPrice) updateData.actual_price = actualPrice;

    const { data: crop, error } = await supabase.from('crops')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .select()
      .single();
      
    if (error || !crop) throw createApiError(404, 'Crop not found');
    res.json({ success: true, message: 'Crop marked as harvested', data: { crop: toCamel(crop) } });
  } catch (err) { next(err); }
});

// ============================================
// MARKETPLACE LISTINGS
// ============================================

// GET /api/farmer/listings/analytics
router.get('/listings/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farmerId = (req as any).farmerId;

    const [
      { count: totalListings },
      { count: activeListings },
      { count: soldListings },
      { data: completedOrders },
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).neq('status', 'deleted'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).in('status', ['active', 'auction']),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('status', 'sold'),
      supabase.from('orders').select('total_amount').eq('farmer_id', farmerId).eq('status', 'completed')
    ]);

    const estimatedRevenue = completedOrders ? completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) : 0;

    res.json({
      success: true,
      data: {
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        soldListings: soldListings || 0,
        estimatedRevenue
      }
    });
  } catch (err) { next(err); }
});

// GET /api/farmer/listings
router.get('/listings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, search } = req.query;
    
    let query = supabase.from('listings').select('*, saves:saved_listings(count), offers(count), orders(count)', { count: 'exact' });
    query = query.eq('farmer_id', (req as any).farmerId);
    
    if (status && status !== 'all') {
      if (status === 'deleted') query = query.eq('status', 'deleted');
      else query = query.eq('status', status).neq('status', 'deleted');
    } else {
      query = query.neq('status', 'deleted');
    }

    if (search) {
      query = query.or(`crop_name.ilike.%${search}%,id.ilike.%${search}%`);
    }
    
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: listings, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    // Flatten count aggregates
    const formattedListings = listings?.map(l => ({
      ...l,
      saved_count: l.saves?.[0]?.count || 0,
      bids_count: l.offers?.[0]?.count || 0,
      orders_count: l.orders?.[0]?.count || 0
    })) || [];

    res.json({ success: true, data: { listings: toCamel(formattedListings), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/listings
router.post('/listings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      type: z.enum(['crop', 'waste']),
      cropId: z.string().optional(),
      wasteId: z.string().optional(),
      title: z.string().min(5),
      description: z.string().min(10),
      quantity: z.number().min(0),
      unit: z.enum(['kg', 'quintal', 'ton']),
      pricePerUnit: z.number().min(0),
      minOrderQuantity: z.number().min(0),
      cropName: z.string(),
      cropVariety: z.string().optional(),
      organicCertified: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      harvestDate: z.string().optional(),
      irrigationType: z.string().optional(),
      qualityGrade: z.string().optional(),
      moisture: z.number().optional(),
      packagingType: z.string().optional(),
      sellingMode: z.string().optional(),
      negotiable: z.boolean().default(false),
      pickupDate: z.string().optional(),
      transportPreference: z.string().optional(),
      address: z.object({
        village: z.string().optional(),
        district: z.string().optional(),
        state: z.string(),
        pincode: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      }),
      images: z.array(z.string()).optional(),
    });
    
    // We remove availableFrom and availableTill from validation to match frontend payload,
    // or we provide defaults if missing.
    const rawData = { ...req.body };
    if (!rawData.availableFrom) rawData.availableFrom = new Date().toISOString();
    if (!rawData.availableTill) rawData.availableTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const data = schema.parse(rawData);
    
    // 1. Run AI Analysis
    const aiInsights = await analyzeListing(data, data.images);
    
    // 2. Prepare listing object
    const { images, ...listingData } = data;
    const dbPayload = { 
      ...toSnake(listingData), 
      farmer_id: (req as any).farmerId,
      ai_score: aiInsights.confidence,
      ai_remarks: aiInsights.suggestion
    };

    // 3. Insert Database Record
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .insert([dbPayload])
      .select()
      .single();
      
    if (listingErr) throw createApiError(500, listingErr.message);

    // 4. Save Images
    if (images && images.length > 0) {
      const imageRecords = images.map(url => ({
        listing_id: listing.id,
        image_url: url,
        thumbnail_url: url, // Assuming same for mock
      }));
      await supabase.from('listing_images').insert(imageRecords);
    }

    // 5. Update Crop Status (if linked)
    if (data.cropId) {
      await supabase.from('crops').update({ status: 'listed' }).eq('id', data.cropId);
    }

    // 6. Generate Search Index (Mock)
    logger.info(`[Search Index] Indexed listing ${listing.id} - ${listing.crop_name}`);

    // 7. Notify Buyers
    await notifyMatchingBuyers((req as any).io, listing);

    // 8. Emit Socket Event
    (req as any).io.emit('listing:new', toCamel(listing));

    res.status(201).json({ 
      success: true, 
      message: 'Listing published successfully', 
      data: { listing: toCamel(listing), aiInsights } 
    });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// DRAFTS
// ============================================

// GET /api/farmer/drafts
router.get('/drafts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: drafts, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('farmer_id', (req as any).farmerId)
      .order('last_saved', { ascending: false });

    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { drafts: toCamel(drafts) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/drafts
router.post('/drafts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { formData, completedStep } = req.body;
    if (!formData) throw createApiError(400, 'formData is required');

    const { data: draft, error } = await supabase
      .from('drafts')
      .insert([{
        farmer_id: (req as any).farmerId,
        form_data: formData,
        completed_step: completedStep || 0,
        last_saved: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw createApiError(500, error.message);
    res.status(201).json({ success: true, message: 'Draft saved', data: { draft: toCamel(draft) } });
  } catch (err) { next(err); }
});

// PUT /api/farmer/listings/:id
router.put('/listings/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: listing, error } = await supabase.from('listings')
      .update(toSnake(req.body))
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .select()
      .single();
      
    if (error || !listing) throw createApiError(404, 'Listing not found');
    res.json({ success: true, message: 'Listing updated', data: { listing: toCamel(listing) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/listings/:id/pause
router.patch('/listings/:id/pause', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: listing, error } = await supabase.from('listings')
      .update({ status: 'paused' })
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .in('status', ['active', 'auction'])
      .select()
      .single();
      
    if (error || !listing) throw createApiError(400, 'Listing cannot be paused');
    res.json({ success: true, message: 'Listing paused', data: { listing: toCamel(listing) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/listings/:id/resume
router.patch('/listings/:id/resume', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: listing, error } = await supabase.from('listings')
      .update({ status: 'active' }) // Simplification: we might need to restore to 'auction' if it was auction
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .eq('status', 'paused')
      .select()
      .single();
      
    if (error || !listing) throw createApiError(400, 'Listing cannot be resumed');
    res.json({ success: true, message: 'Listing resumed', data: { listing: toCamel(listing) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/listings/:id/republish
router.post('/listings/:id/republish', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: oldListing, error: fetchErr } = await supabase.from('listings')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .single();
      
    if (fetchErr || !oldListing) throw createApiError(404, 'Listing not found');
    
    if (['active', 'auction'].includes(oldListing.status)) {
      throw createApiError(400, 'Active listings cannot be republished directly');
    }

    const { id, created_at, updated_at, views, ai_score, ai_remarks, ...cloneData } = oldListing;
    cloneData.status = 'active'; // Reset status
    cloneData.available_from = new Date().toISOString();
    cloneData.available_till = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days

    const { data: newListing, error: insertErr } = await supabase.from('listings')
      .insert([cloneData])
      .select()
      .single();

    if (insertErr) throw createApiError(500, insertErr.message);

    res.json({ success: true, message: 'Listing republished', data: { listing: toCamel(newListing) } });
  } catch (err) { next(err); }
});

// DELETE /api/farmer/listings/:id (Soft Delete)
router.delete('/listings/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Prevent deleting a listing with active orders if we want to be strict.
    // For now, we'll soft delete it.
    const { data: listing, error } = await supabase.from('listings')
      .update({ status: 'deleted' })
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .select()
      .single();
      
    if (error || !listing) throw createApiError(404, 'Listing not found or cannot be deleted');
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) { next(err); }
});

// ============================================
// OFFERS
// ============================================

// GET /api/farmer/offers
router.get('/offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;
    
    let query = supabase.from('offers')
      .select('*, listing_id:listings!listing_id(title, crop_name), buyer_id:users!buyer_id(name, avatar, email, phone), industry_id:users!industry_id(name, avatar, email, phone)', { count: 'exact' })
      .eq('farmer_id', (req as any).farmerId);
      
    if (status) query = query.eq('status', status);
    
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: offers, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: { offers: toCamel(offers), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/offers/:id/accept
router.patch('/offers/:id/accept', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: offer, error: findErr } = await supabase.from('offers')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .eq('status', 'pending')
      .single();
      
    if (findErr || !offer) throw createApiError(404, 'Offer not found');

    const updatedHistory = [
      ...(offer.history || []),
      { action: 'accepted', price: offer.offered_price, by: req.user!.id, at: new Date().toISOString() }
    ];

    const { data: updatedOffer, error: updateErr } = await supabase.from('offers')
      .update({ status: 'accepted', history: updatedHistory })
      .eq('id', offer.id)
      .select()
      .single();
      
    if (updateErr) throw createApiError(500, updateErr.message);

    // Update listing status
    await supabase.from('listings').update({ status: 'in_negotiation' }).eq('id', offer.listing_id);

    // Emit notification via Socket.IO
    const io = (req as any).io;
    const buyerId = offer.buyer_id || offer.industry_id;
    if (io && buyerId) {
      io.to(`user_${buyerId}`).emit('offer_update', { offerId: offer.id, status: 'accepted' });
    }

    res.json({ success: true, message: 'Offer accepted', data: { offer: toCamel(updatedOffer) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/offers/:id/reject
router.patch('/offers/:id/reject', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: offer, error: findErr } = await supabase.from('offers')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .in('status', ['pending', 'counter'])
      .single();

    if (findErr || !offer) throw createApiError(404, 'Offer not found');

    const updatedHistory = [
      ...(offer.history || []),
      { action: 'rejected', price: 0, by: req.user!.id, at: new Date().toISOString() }
    ];

    const { data: updatedOffer, error: updateErr } = await supabase.from('offers')
      .update({ status: 'rejected', history: updatedHistory })
      .eq('id', offer.id)
      .select()
      .single();

    if (updateErr) throw createApiError(500, updateErr.message);

    res.json({ success: true, message: 'Offer rejected', data: { offer: toCamel(updatedOffer) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/offers/:id/counter
router.patch('/offers/:id/counter', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { counterPrice, counterMessage } = req.body;
    if (!counterPrice) throw createApiError(400, 'Counter price required');

    const { data: offer, error: findErr } = await supabase.from('offers')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .eq('status', 'pending')
      .single();
      
    if (findErr || !offer) throw createApiError(404, 'Offer not found');

    const updatedHistory = [
      ...(offer.history || []),
      { action: 'counter', price: counterPrice, by: req.user!.id, message: counterMessage, at: new Date().toISOString() }
    ];

    const { data: updatedOffer, error: updateErr } = await supabase.from('offers')
      .update({
        status: 'counter',
        counter_price: counterPrice,
        counter_message: counterMessage,
        counter_by: req.user!.id,
        history: updatedHistory
      })
      .eq('id', offer.id)
      .select()
      .single();

    if (updateErr) throw createApiError(500, updateErr.message);

    res.json({ success: true, message: 'Counter offer sent', data: { offer: toCamel(updatedOffer) } });
  } catch (err) { next(err); }
});

// ============================================
// CONTRACTS
// ============================================

// GET /api/farmer/contracts
router.get('/contracts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: contracts, error } = await supabase.from('contracts')
      .select('*, buyer_id:users!buyer_id(name, email, phone), industry_id:users!industry_id(name, email, phone)')
      .eq('farmer_id', (req as any).farmerId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { contracts: toCamel(contracts) } });
  } catch (err) { next(err); }
});

// PATCH /api/farmer/contracts/:id/sign
router.patch('/contracts/:id/sign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: contract, error: findErr } = await supabase.from('contracts')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', (req as any).farmerId)
      .eq('status', 'draft')
      .single();
      
    if (findErr || !contract) throw createApiError(404, 'Contract not found');

    const signatures = contract.signatures || {};
    signatures.farmer = { signedAt: new Date().toISOString(), ipAddress: req.ip };

    const { data: updatedContract, error: updateErr } = await supabase.from('contracts')
      .update({ signatures, status: 'signed' })
      .eq('id', contract.id)
      .select()
      .single();
      
    if (updateErr) throw createApiError(500, updateErr.message);

    // Create order upon contract signing
    const newOrder = {
      contract_id: contract.id,
      farmer_id: contract.farmer_id,
      buyer_id: contract.buyer_id,
      industry_id: contract.industry_id,
      total_amount: contract.total_amount,
      status: 'contract_signed',
      timeline: [{
        status: 'contract_signed',
        label: 'Contract Signed',
        timestamp: new Date().toISOString(),
        actor: req.user!.id,
        actorRole: 'farmer',
      }],
    };
    
    await supabase.from('orders').insert([newOrder]);

    res.json({ success: true, message: 'Contract signed', data: { contract: toCamel(updatedContract) } });
  } catch (err) { next(err); }
});

// ============================================
// ANALYTICS
// ============================================

// GET /api/farmer/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farmerId = (req as any).farmerId;

    const [
      { count: totalFarms },
      { count: totalCrops },
      { count: activeCrops },
      { count: activeListings },
      { count: totalOffers },
      { count: pendingOffers },
      { count: activeContracts },
      { count: completedOrders },
    ] = await Promise.all([
      supabase.from('farms').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('is_active', true),
      supabase.from('crops').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId),
      supabase.from('crops').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).in('status', ['planted', 'growing', 'ready']),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('status', 'active'),
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId),
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('status', 'pending'),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).in('status', ['signed', 'active']),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('status', 'completed'),
    ]);

    res.json({
      success: true,
      data: {
        overview: { 
          totalFarms: totalFarms || 0, 
          totalCrops: totalCrops || 0, 
          activeCrops: activeCrops || 0, 
          activeListings: activeListings || 0, 
          totalOffers: totalOffers || 0, 
          pendingOffers: pendingOffers || 0, 
          activeContracts: activeContracts || 0, 
          completedOrders: completedOrders || 0 
        },
        cropsByStatus: [], // Requires aggregation/rpc
      },
    });
  } catch (err) { next(err); }
});

// ============================================
// TRANSPORT BOOKINGS
// ============================================

// GET /api/farmer/transport
router.get('/transport', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: bookings, error } = await supabase.from('transport_bookings')
      .select('*, transporter_id:users!transporter_id(name, phone), vehicle_id:vehicles!vehicle_id(*)')
      .eq('farmer_id', (req as any).farmerId)
      .order('created_at', { ascending: false });
      
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: { bookings: toCamel(bookings) } });
  } catch (err) { next(err); }
});

// POST /api/farmer/transport
router.post('/transport', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      orderId: z.string(),
      pickupAddress: z.object({
        village: z.string().optional(),
        district: z.string().optional(),
        state: z.string(),
        pincode: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      }),
      deliveryAddress: z.object({
        village: z.string().optional(),
        district: z.string().optional(),
        state: z.string(),
        pincode: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      }),
      pickupDate: z.string().transform(d => new Date(d).toISOString()),
      cargo: z.string(),
      weight: z.number().min(0),
      weightUnit: z.enum(['kg', 'ton']),
      specialInstructions: z.string().optional(),
    });
    const data = schema.parse(req.body);
    
    const { data: booking, error } = await supabase.from('transport_bookings').insert([{ ...toSnake(data), farmer_id: (req as any).farmerId }]).select().single();
    if (error) throw createApiError(500, error.message);
    
    res.status(201).json({ success: true, message: 'Transport booking requested', data: { booking: toCamel(booking) } });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// ============================================
// GOVERNMENT SCHEMES
// ============================================

// GET /api/farmer/schemes
router.get('/schemes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    
    let query = supabase.from('government_schemes')
      .select('*')
      .eq('is_active', true)
      .contains('target_roles', ['farmer']);
      
    if (state) {
      query = query.or(`state.eq.${state},state.is.null`);
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });
    if (error) throw createApiError(500, error.message);
    
    res.json({ success: true, data: { schemes: toCamel(schemes) } });
  } catch (err) { next(err); }
});

// ============================================
// DASHBOARD OVERVIEW
// ============================================

  router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Existing generic dashboard data
      res.json({ success: true, data: { stats: { activeListings: 8, farms: 1 } } });
    } catch (err) { next(err); }
  });

  // V3.1 Mock Endpoints
  router.get('/market-prices', async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      data: [
        { crop: 'Rice', current: 2100, previous: 2050, trend: 'up', market: 'Azadpur Mandi' },
        { crop: 'Cotton', current: 6500, previous: 6600, trend: 'down', market: 'Guntur' },
        { crop: 'Wheat', current: 2200, previous: 2180, trend: 'up', market: 'Indore' },
        { crop: 'Tomato', current: 3500, previous: 3500, trend: 'neutral', market: 'Kolar' }
      ]
    });
  });

  router.get('/orders/recent', async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      data: [
        { id: 'ORD-101', buyer: 'AgriCorp', crop: 'Wheat', quantity: '50 Tonnes', status: 'Pending' },
        { id: 'ORD-102', buyer: 'Fresh Foods', crop: 'Rice', quantity: '20 Tonnes', status: 'Accepted' },
        { id: 'ORD-103', buyer: 'BioEnergy Pvt', crop: 'Stubble', quantity: '100 Tonnes', status: 'Transport' }
      ]
    });
  });

  router.get('/wallet/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      data: {
        balance: 145000,
        pending: 25000,
        recent: [
          { type: 'credit', amount: 45000, desc: 'Payment from AgriCorp' },
          { type: 'debit', amount: 5000, desc: 'Transport Fee' }
        ]
      }
    });
  });

  router.get('/crops/health', async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      data: {
        healthy: 4,
        diseased: 1,
        pending: 0,
        alerts: ['Mildew detected in Farm A', 'Low soil moisture in Farm B']
      }
    });
  });

  // ============================================
  // TRANSPORT BOOKING (FARMER)
  // ============================================

  router.post('/transport/book', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const farmerId = req.user!.id; // booking linked to user_id for simplicity, or we can look up farmer

      const schema = z.object({
        cropName: z.string(),
        quantity: z.number(),
        weight: z.number(),
        pickupAddress: z.any(),
        deliveryAddress: z.any(),
        pickupTime: z.string(),
        vehicleType: z.string(),
        estimatedFreight: z.number().optional(),
        temperatureRequirement: z.string().optional(),
        loadingAssistance: z.boolean().optional(),
        insurance: z.boolean().optional(),
        fragileGoods: z.boolean().optional(),
        deliveryNotes: z.string().optional()
      });

      const data = schema.parse(req.body);

      const dbPayload = {
        farmer_id: farmerId,
        crop_name: data.cropName,
        quantity: data.quantity,
        weight: data.weight,
        pickup_address: data.pickupAddress,
        delivery_address: data.deliveryAddress,
        pickup_time: data.pickupTime,
        vehicle_type: data.vehicleType,
        estimated_freight: data.estimatedFreight,
        status: 'searching',
        temperature_requirement: data.temperatureRequirement,
        loading_assistance: data.loadingAssistance,
        insurance: data.insurance,
        fragile_goods: data.fragileGoods,
        delivery_notes: data.deliveryNotes
      };

      const { data: booking, error } = await supabase
        .from('transport_bookings')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw createApiError(500, error.message);

      // Emit event for transporters
      if ((req as any).io) {
        (req as any).io.emit('booking:created', booking);
      }

      res.status(201).json({ success: true, message: 'Transport booked successfully', data: { booking: toCamel(booking) } });
    } catch (err) {
      if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
      else next(err);
    }
  });

  router.get('/transport/tracking/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Return simulated live tracking for now
      const bookingId = req.params.id;
      
      res.json({
        success: true,
        data: {
          bookingId,
          vehiclePosition: { lat: 28.6139, lng: 77.2090 }, // Mock New Delhi
          driverLocation: 'NH-44 Highway',
          speed: '45 km/h',
          eta: '2 hrs 15 mins',
          distanceRemaining: '95 km',
          status: 'In Transit',
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (err) { next(err); }
  });

  router.post('/ml/dashboard-recommendations', async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      data: {
        advice: 'Apply Nitrogen fertilizer to Wheat field in the next 2 days before the rain.',
        recommendedCrop: 'Soybean (High demand next season)',
        diseaseAlert: 'High humidity may cause blight. Monitor Tomatoes.',
        weatherWarning: 'Heavy rainfall expected on Friday.',
        waterRecommendation: 'Skip irrigation today due to recent rains.',
        fertilizerAdvice: 'Urea application recommended for Cotton.'
      }
    });
  });

// ============================================
// WAREHOUSE & COLD STORAGE (PART 2)
// ============================================

router.get('/warehouse/inventory', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: inventory, error } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('farmer_id', req.user!.id)
      .order('stored_at', { ascending: false });

    if (error) throw error;

    // Mock if none exists
    const mockInventory = inventory?.length ? toCamel(inventory) : [
      { id: 'inv_1', warehouseName: 'AgriCorp Cold Storage', cropName: 'Tomato', quantity: 50, weight: 500, qualityGrade: 'Grade A', storageType: 'cold', temperatureLogged: 4, humidityLogged: 85, status: 'stored', storedAt: new Date().toISOString() },
      { id: 'inv_2', warehouseName: 'National Dry Warehouse', cropName: 'Wheat', quantity: 100, weight: 5000, qualityGrade: 'Standard', storageType: 'dry', temperatureLogged: 22, humidityLogged: 40, status: 'stored', storedAt: new Date().toISOString() }
    ];

    res.json({ success: true, data: { inventory: mockInventory } });
  } catch (err) { next(err); }
});

router.post('/warehouse/book', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseName, cropName, expectedWeight, storageType, expectedArrival, durationDays } = req.body;
    
    // Simulate cost calculation
    const baseCost = storageType === 'cold' ? 50 : 20; // per ton per day
    const estimatedCost = (expectedWeight / 1000) * durationDays * baseCost;

    const { data: booking, error } = await supabase
      .from('warehouse_bookings')
      .insert({
        farmer_id: req.user!.id,
        warehouse_name: warehouseName,
        crop_name: cropName,
        expected_weight: expectedWeight,
        storage_type: storageType,
        expected_arrival: expectedArrival,
        duration_days: durationDays,
        estimated_cost: estimatedCost,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: { booking: toCamel(booking) } });
  } catch (err) { next(err); }
});

export default router;
