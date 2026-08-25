import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';

const router = Router();
router.use(authenticate);

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

// GET /api/v1/iot/devices
router.get('/devices', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: devices, error } = await supabase
      .from('iot_devices')
      .select('*, farm_zones(*)')
      .eq('farmer_id', req.user!.id);
      
    if (error) throw error;
    
    // If no devices exist, let's create a couple of mock ones for demonstration
    if (!devices || devices.length === 0) {
      const mockZone = await supabase.from('farm_zones').insert({
        farmer_id: req.user!.id, name: 'North Field', crop: 'Tomato', area_acres: 2.5
      }).select().single();
      
      await supabase.from('iot_devices').insert([
        { farmer_id: req.user!.id, zone_id: mockZone.data?.id, device_name: 'Soil Sensor Node 1', device_type: 'sensor', battery_status: 85, connectivity_status: 'online' },
        { farmer_id: req.user!.id, zone_id: mockZone.data?.id, device_name: 'Main Valve Controller', device_type: 'controller', battery_status: 100, connectivity_status: 'online' }
      ]);
      
      const newDevices = await supabase.from('iot_devices').select('*, farm_zones(*)').eq('farmer_id', req.user!.id);
      res.json({ success: true, data: { devices: toCamel(newDevices.data) } });
      return;
    }
    
    res.json({ success: true, data: { devices: toCamel(devices) } });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/sensors
router.get('/sensors', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Generate simulated real-time telemetry
    const telemetry = {
      soilMoisture: 45 + (Math.random() * 10 - 5), // 40-50%
      soilTemperature: 22 + (Math.random() * 4 - 2), // 20-24 C
      airTemperature: 28 + (Math.random() * 5 - 2.5), // 25.5 - 30.5 C
      humidity: 60 + (Math.random() * 10 - 5), // 55-65%
      nitrogen: 85, // mg/kg
      phosphorus: 40,
      potassium: 120,
      phLevel: 6.5,
      waterTankLevel: 75, // %
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: telemetry });
  } catch (err) { next(err); }
});

// POST /api/v1/iot/irrigation/start
router.post('/irrigation/start', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { zoneId, durationMinutes = 30 } = req.body;
    
    // Simulate command to MQTT broker / physical controller
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { data: log, error } = await supabase.from('irrigation_logs').insert({
      farmer_id: req.user!.id,
      zone_id: zoneId || null,
      duration_minutes: durationMinutes,
      trigger_source: 'manual'
    }).select().single();
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Irrigation started successfully', data: { log: toCamel(log) } });
  } catch (err) { next(err); }
});

// POST /api/v1/iot/irrigation/stop
router.post('/irrigation/stop', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { logId } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (logId) {
      await supabase.from('irrigation_logs').update({ stopped_at: new Date().toISOString(), water_used_liters: Math.floor(Math.random() * 500) + 100 }).eq('id', logId);
    }
    
    res.json({ success: true, message: 'Irrigation stopped' });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/weather
router.get('/weather', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const weather = {
      temperature: 28,
      condition: 'Sunny',
      rainfallMm: 0,
      windSpeedKmh: 12,
      uvIndex: 6,
      forecast: 'Clear skies expected for the next 48 hours. No rain predicted.'
    };
    res.json({ success: true, data: weather });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/alerts
router.get('/alerts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: alerts, error } = await supabase
      .from('iot_alerts')
      .select('*')
      .eq('farmer_id', req.user!.id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data: { alerts: toCamel(alerts) } });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/drone/missions
router.get('/drone/missions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: missions, error } = await supabase
      .from('drone_missions')
      .select('*')
      .eq('farmer_id', req.user!.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data: { missions: toCamel(missions) } });
  } catch (err) { next(err); }
});

// POST /api/v1/iot/drone/missions
router.post('/drone/missions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { zoneId, missionType, droneName = 'AgriDrone Pro' } = req.body;
    
    const { data: mission, error } = await supabase.from('drone_missions').insert({
      farmer_id: req.user!.id,
      zone_id: zoneId || null,
      drone_name: droneName,
      mission_type: missionType,
      status: 'scheduled'
    }).select().single();
    
    if (error) throw error;
    res.json({ success: true, message: 'Drone mission scheduled', data: { mission: toCamel(mission) } });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/satellite/ndvi
router.get('/satellite/ndvi', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Return simulated NDVI mock data
    const ndviData = {
      averageScore: 0.75, // Healthy vegetation
      captureDate: new Date().toISOString(),
      resolution: '10m',
      insights: [
        'Crop health is optimal in North Field.',
        'Minor water stress detected in the south-east corner.',
      ]
    };
    res.json({ success: true, data: ndviData });
  } catch (err) { next(err); }
});

// GET /api/v1/iot/predictions
router.get('/predictions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const predictions = [
      {
        id: 'pred_1',
        predictionType: 'disease_risk',
        confidenceScore: 0.92,
        riskLevel: 'low',
        details: { disease: 'Leaf Blight', prevention: 'Maintain current fungicide schedule.' },
        createdAt: new Date().toISOString()
      },
      {
        id: 'pred_2',
        predictionType: 'yield_forecast',
        confidenceScore: 0.88,
        riskLevel: 'medium',
        details: { estimatedYield: '4.5 Tons/Acre', harvestWindow: 'Oct 15 - Oct 25' },
        createdAt: new Date().toISOString()
      }
    ];
    res.json({ success: true, data: { predictions } });
  } catch (err) { next(err); }
});

export default router;
