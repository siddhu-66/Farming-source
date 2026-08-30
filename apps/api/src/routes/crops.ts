import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest } from '../middleware';
import { getGeminiModel } from '../services/gemini.service';
import axios from 'axios';

const router = Router();
router.use(authenticate);

// Utility to get farmer_id from user_id
const getFarmerId = async (userId: string) => {
  const { data, error } = await supabase
    .from('farmers')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error || !data) throw new Error('Farmer profile not found');
  return data.id;
};

// GET /api/v1/farmer/crops - List all crops
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    // Fetch crops with parcel and farm names if needed.
    // For now, just basic crops and their activities/images.
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        crop_activities (id, activity_type, activity_date),
        crop_images (id, image_url, image_type),
        land_parcels (parcel_name)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase
    const formattedData = data.map((c: any) => ({
      id: c.id,
      farmId: c.farm_id,
      parcelId: c.parcel_id,
      parcelName: c.land_parcels?.parcel_name,
      cropName: c.crop_name,
      category: c.category,
      variety: c.variety,
      area: c.area,
      seedSource: c.seed_source,
      seedQuantity: c.seed_quantity,
      sowingDate: c.sowing_date,
      expectedHarvestDate: c.expected_harvest_date,
      season: c.season,
      soilType: c.soil_type,
      irrigationMethod: c.irrigation_method,
      currentStage: c.current_stage,
      healthScore: c.health_score,
      status: c.status,
      activities: c.crop_activities?.map((a: any) => ({
        id: a.id,
        activityType: a.activity_type,
        activityDate: a.activity_date
      })),
      images: c.crop_images?.map((i: any) => ({
        id: i.id,
        imageUrl: i.image_url,
        imageType: i.image_type
      }))
    }));

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/farmer/crops/:id - Get specific crop
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        crop_activities (*),
        crop_images (*),
        crop_notes (*),
        crop_calendar (*),
        land_parcels (parcel_name)
      `)
      .eq('id', id)
      .eq('farmer_id', farmerId)
      .single();

    if (error) throw error;

    const formattedData = {
      id: data.id,
      farmId: data.farm_id,
      parcelId: data.parcel_id,
      parcelName: data.land_parcels?.parcel_name,
      cropName: data.crop_name,
      category: data.category,
      variety: data.variety,
      area: data.area,
      seedSource: data.seed_source,
      seedQuantity: data.seed_quantity,
      sowingDate: data.sowing_date,
      expectedHarvestDate: data.expected_harvest_date,
      season: data.season,
      soilType: data.soil_type,
      irrigationMethod: data.irrigation_method,
      currentStage: data.current_stage,
      healthScore: data.health_score,
      status: data.status,
      activities: data.crop_activities?.map((a: any) => ({
        id: a.id,
        activityType: a.activity_type,
        activityDate: a.activity_date,
        description: a.description,
        cost: a.cost,
        performedBy: a.performed_by
      })).sort((a: any, b: any) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()),
      images: data.crop_images?.map((i: any) => ({
        id: i.id,
        imageUrl: i.image_url,
        imageType: i.image_type,
        analysisResult: i.analysis_result,
        capturedAt: i.captured_at
      })),
      notes: data.crop_notes?.map((n: any) => ({
        id: n.id,
        note: n.note,
        createdAt: n.created_at
      })),
      calendar: data.crop_calendar?.map((c: any) => ({
        id: c.id,
        eventType: c.event_type,
        eventDate: c.event_date,
        status: c.status,
        notes: c.notes
      }))
    };

    res.json({ success: true, data: formattedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/crops - Register a new crop
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const {
      farmId, parcelId, cropName, category, variety, area, seedSource, 
      seedQuantity, sowingDate, expectedHarvestDate, season, soilType, irrigationMethod
    } = req.body;

    const { data, error } = await supabase
      .from('crops')
      .insert({
        farmer_id: farmerId,
        farm_id: farmId,
        parcel_id: parcelId,
        crop_name: cropName,
        category: category,
        variety: variety,
        area: area,
        seed_source: seedSource,
        seed_quantity: seedQuantity,
        sowing_date: sowingDate,
        expected_harvest_date: expectedHarvestDate,
        season: season,
        soil_type: soilType,
        irrigation_method: irrigationMethod,
        current_stage: 'Planned',
        health_score: 100,
        status: 'Active'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Automatically add initial activity
    await supabase.from('crop_activities').insert({
      crop_id: data.id,
      activity_type: 'Planning',
      activity_date: new Date().toISOString(),
      description: 'Crop registered in system'
    });

    res.json({ success: true, data: { id: data.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/farmer/crops/:id - Update crop
router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    // Ensure ownership
    const { data: cropCheck } = await supabase.from('crops').select('id').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const updateData: any = {};
    const b = req.body;
    if (b.cropName) updateData.crop_name = b.cropName;
    if (b.category) updateData.category = b.category;
    if (b.variety) updateData.variety = b.variety;
    if (b.area) updateData.area = b.area;
    if (b.seedSource) updateData.seed_source = b.seedSource;
    if (b.seedQuantity) updateData.seed_quantity = b.seedQuantity;
    if (b.sowingDate) updateData.sowing_date = b.sowingDate;
    if (b.expectedHarvestDate) updateData.expected_harvest_date = b.expectedHarvestDate;
    if (b.season) updateData.season = b.season;
    if (b.soilType) updateData.soil_type = b.soilType;
    if (b.irrigationMethod) updateData.irrigation_method = b.irrigationMethod;
    if (b.currentStage) updateData.current_stage = b.currentStage;
    if (b.healthScore) updateData.health_score = b.healthScore;
    if (b.status) updateData.status = b.status;

    const { error } = await supabase.from('crops').update(updateData).eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: "Crop updated" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/farmer/crops/:id - Delete a crop
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    const { error } = await supabase.from('crops').delete().eq('id', id).eq('farmer_id', farmerId);
    if (error) throw error;

    res.json({ success: true, message: "Crop deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/crops/:id/activities - Add activity
router.post('/:id/activities', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    // Ensure ownership
    const { data: cropCheck } = await supabase.from('crops').select('id').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const { activityType, activityDate, description, cost, performedBy } = req.body;

    const { data, error } = await supabase
      .from('crop_activities')
      .insert({
        crop_id: id,
        activity_type: activityType,
        activity_date: activityDate,
        description,
        cost,
        performed_by: performedBy
      })
      .select()
      .single();

    if (error) throw error;
    
    // If activity is Irrigation or Fertilizer, we could optionally update the crop health or stage logic here.
    
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/crops/:id/photos - Upload photo with real Gemini AI analysis
router.post('/:id/photos', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;

    const { data: cropCheck } = await supabase.from('crops').select('id, crop_name').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const { imageUrl, imageType } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI analysis unavailable. Please check your image and try again.'
      });
    }

    let base64Image: string;
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) {
        return res.status(422).json({ success: false, message: 'Invalid image data URI' });
      }
      mimeType = match[1];
      base64Image = match[2];
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
        });

        const contentType = imageResponse.headers['content-type'] ? String(imageResponse.headers['content-type']) : '';
        if (contentType && contentType.startsWith('image/')) {
          mimeType = contentType.split(';')[0];
        } else if (imageUrl.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (imageUrl.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        base64Image = Buffer.from(imageResponse.data).toString('base64');
      } catch (imgErr) {
        return res.status(422).json({
          success: false,
          message: 'Invalid image. Unable to fetch image from URL.'
        });
      }
    } else {
      return res.status(422).json({
        success: false,
        message: 'Invalid image URL format.'
      });
    }

    let analysisResult: any = null;

    try {
      const model = getGeminiModel(process.env.AI_MODEL || 'gemini-1.5-flash');
      const prompt = `Analyze this agricultural crop image. Identify: 1) crop health status (Healthy/Disease Detected/Pest Infestation/Nutrient Deficiency), 2) specific disease/issue name if detected, 3) confidence score 0-1, 4) visible symptoms, 5) recommended treatment, 6) prevention measures. Respond in JSON format: { status, disease, confidence, symptoms, recommendation, prevention }`;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          const timeoutErr: any = new Error('AI analysis timed out');
          timeoutErr.status = 503;
          reject(timeoutErr);
        }, 30000)
      );

      const analysisPromise = model.generateContent([prompt, imagePart]);
      const result = (await Promise.race([analysisPromise, timeoutPromise])) as any;
      const responseText = result.response.text();

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = {
            status: "Analysis Completed",
            disease: "Unable to parse specific disease",
            confidence: 0.5,
            symptoms: responseText.substring(0, 200),
            recommendation: "Please consult with an agricultural expert",
            prevention: "Follow standard crop management practices"
          };
        }
      } catch (parseError) {
        analysisResult = {
          status: "Analysis Completed",
          disease: "Parsing error",
          confidence: 0.5,
          symptoms: responseText.substring(0, 200),
          recommendation: "Please consult with an agricultural expert",
          prevention: "Follow standard crop management practices"
        };
      }
    } catch (aiError: any) {
      console.error('Gemini AI Error:', aiError);

      if (aiError.message === 'AI analysis timed out' || aiError.status === 503) {
        return res.status(503).json({
          success: false,
          message: 'AI analysis timed out. Please try again.'
        });
      }

      return res.status(503).json({
        success: false,
        message: 'AI analysis unavailable. Please check your image and try again.'
      });
    }

    const { data, error } = await supabase
      .from('crop_images')
      .insert({
        crop_id: id,
        image_url: imageUrl,
        image_type: imageType,
        analysis_result: analysisResult
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/farmer/crops/:id/yield - Yield prediction
router.get('/:id/yield', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    // Ensure ownership
    const { data: cropCheck } = await supabase.from('crops').select('id, crop_name, area, expected_harvest_date').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    // Mock Yield Prediction
    const prediction = {
      expectedYield: (cropCheck.area * 2.5).toFixed(2), // Mock: 2.5 tons per acre
      confidenceScore: 85,
      estimatedHarvestDate: cropCheck.expected_harvest_date,
    };

    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/farmer/crops/:id/irrigation - Irrigation plan
router.get('/:id/irrigation', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    const { data: cropCheck } = await supabase.from('crops').select('id, irrigation_method').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plan = {
      nextIrrigationDate: tomorrow.toISOString().split('T')[0],
      waterQuantity: 1250,
      durationMinutes: 120,
      recommendedMethod: cropCheck.irrigation_method || 'Drip Irrigation',
      rainDelayWarning: false
    };

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/farmer/crops/:id/fertilizer - Fertilizer schedule
router.get('/:id/fertilizer', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    const { data: cropCheck } = await supabase.from('crops').select('id, current_stage').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const schedule = [
      { stage: 'Sowing', fertilizer: 'Basal Dose NPK', status: 'Completed' },
      { stage: 'Vegetative', fertilizer: 'Nitrogen (Urea)', status: cropCheck.current_stage === 'Vegetative' ? 'Due' : 'Pending' },
      { stage: 'Flowering', fertilizer: 'NPK 19:19:19', status: 'Pending' },
      { stage: 'Fruiting', fertilizer: 'Potassium', status: 'Pending' }
    ];

    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/farmer/crops/:id/analytics - Crop analytics
router.get('/:id/analytics', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { id } = req.params;
    
    const { data: cropCheck } = await supabase.from('crops').select('id').eq('id', id).eq('farmer_id', farmerId).single();
    if (!cropCheck) return res.status(403).json({ success: false, message: "Unauthorized" });

    const analytics = {
      growthProgress: [
        { week: 'W1', height: 10, healthy: 100 },
        { week: 'W2', height: 25, healthy: 95 },
        { week: 'W3', height: 45, healthy: 90 },
        { week: 'W4', height: 70, healthy: 88 }
      ],
      costVsProfit: [
        { category: 'Seeds', cost: 5000 },
        { category: 'Fertilizer', cost: 12000 },
        { category: 'Labor', cost: 8000 },
        { category: 'Irrigation', cost: 3000 }
      ],
      expectedRevenue: 85000
    };

    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
