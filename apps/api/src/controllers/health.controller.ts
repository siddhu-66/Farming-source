import { Request, Response, NextFunction } from 'express';
import { formatSuccess } from '../utils/formatResponse';
import { supabase } from '../config/supabase';

export const getHealth = (req: Request, res: Response, next: NextFunction) => {
  res.json(formatSuccess('AgriAssist API is running', {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }));
};

export const getDatabaseHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ping Supabase
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;

    res.json(formatSuccess('Database connection is healthy', {
      provider: 'Supabase Postgres'
    }));
  } catch (error) {
    next(error);
  }
};

export const getStorageHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    res.json(formatSuccess('Storage connection is healthy', {
      provider: 'Supabase Storage',
      bucketsAvailable: data?.length || 0
    }));
  } catch (error) {
    next(error);
  }
};

export const getSocketHealth = (req: Request, res: Response, next: NextFunction) => {
  const io = req.app.get('io');
  res.json(formatSuccess('Socket connection is healthy', {
    provider: 'Socket.IO',
    activeConnections: io ? io.engine.clientsCount : 0
  }));
};

export const getAuthHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic checks for the blueprint
    // Database check
    const { error: dbError } = await supabase.from('users').select('id').limit(1);
    
    // JWT Check (ensure secrets exist)
    const jwtActive = !!process.env.JWT_SECRET && !!process.env.JWT_REFRESH_SECRET;
    
    // OTP Check (ensure twilio credentials exist or stubbed)
    const otpActive = !!process.env.TWILIO_ACCOUNT_SID || process.env.NODE_ENV !== 'production';

    // Storage check
    const { error: storageError } = await supabase.storage.listBuckets();

    const isHealthy = !dbError && jwtActive && otpActive && !storageError;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbError ? 'disconnected' : 'connected',
      jwt: jwtActive ? 'active' : 'inactive',
      otp: otpActive ? 'available' : 'unavailable',
      storage: storageError ? 'disconnected' : 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
