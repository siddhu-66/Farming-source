import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from '../utils/apiError';
import { supabase } from '../config/supabase';

export const accountStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(createApiError(401, 'Authentication required'));
    }

    const { data: user } = await supabase
      .from('users')
      .select('status, is_deleted')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user) {
      return next(createApiError(401, 'User account not found'));
    }

    if (user.is_deleted) {
      return next(createApiError(403, 'User account has been deleted'));
    }

    if (user.status === 'SUSPENDED') {
      return next(createApiError(403, 'User account is suspended'));
    }

    if (user.status !== 'ACTIVE') {
      return next(createApiError(403, `User account is ${user.status}`));
    }

    // Optional: enforce verification
    // if (!user.is_verified) {
    //   return next(createApiError(403, 'User account is not verified'));
    // }

    next();
  } catch (error) {
    next(error);
  }
};
