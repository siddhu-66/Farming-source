import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from '../utils/apiError';
import { supabase } from '../config/supabase';

export const validateDevice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.deviceId) {
      return next(createApiError(401, 'Device fingerprint missing'));
    }

    const { data: device } = await supabase
      .from('trusted_devices')
      .select('status')
      .eq('id', req.user.deviceId)
      .maybeSingle();

    if (!device) {
      return next(createApiError(401, 'Unrecognized device'));
    }

    if (device.status === 'blocked') {
      return next(createApiError(403, 'Device is blocked. Access denied.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
