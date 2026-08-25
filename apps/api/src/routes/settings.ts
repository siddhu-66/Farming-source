import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, authorizeRole } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';

const router = Router();

// Mock in-memory configuration store for dev
let mockSettings = {
  general: {
    platformName: 'AgriAssist',
    supportEmail: 'support@agriassist.in',
    timezone: 'Asia/Kolkata'
  },
  branding: {
    themeColor: '#10b981',
    font: 'Inter'
  },
  apiConfig: {
    aiProvider: 'Gemini 2.0 Flash',
    weatherProvider: 'OpenWeather',
    googleMapsEnabled: true
  },
  security: {
    jwtExpiryDays: 7,
    otpLength: 6,
    mfaRequired: false
  },
  featureFlags: {
    enableMarketplace: true,
    enableAI: true,
    enableWallet: true,
    enableGovernmentSchemes: true
  },
  maintenance: {
    enabled: false,
    message: 'System is undergoing scheduled maintenance.'
  }
};

// Protect all routes with Super Admin authorization
router.use(authenticate, authorizeRole('ADMIN'));

// GET /api/admin/settings
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: { settings: mockSettings } });
  } catch (err) { next(err); }
});

// PATCH /api/admin/settings/:category
router.patch('/:category', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category as string;
    const updates = req.body;

    if (!mockSettings || !(category in mockSettings)) {
      throw createApiError(400, 'Invalid settings category');
    }

    const typedCategory = category as keyof typeof mockSettings;
    
    // Merge updates
    mockSettings = {
      ...mockSettings,
      [typedCategory]: {
        ...mockSettings[typedCategory],
        ...updates
      }
    };

    res.json({ success: true, message: 'Settings updated successfully', data: { category: mockSettings[typedCategory] } });
  } catch (err) { next(err); }
});

// POST /api/admin/settings/backup
router.post('/backup', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Simulate backup delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    res.json({ success: true, message: 'Database backup completed successfully.' });
  } catch (err) { next(err); }
});

// POST /api/admin/settings/restore
router.post('/restore', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Simulate restore delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    res.json({ success: true, message: 'System restored from backup.' });
  } catch (err) { next(err); }
});

export default router;
