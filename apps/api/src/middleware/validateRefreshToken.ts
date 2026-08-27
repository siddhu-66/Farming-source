import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { createApiError } from '../utils/apiError';
import jwt from 'jsonwebtoken';

export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(createApiError(400, 'Refresh token is required'));
    }

    // Usually, we verify the JWT of the refresh token if it is one, but we can just query the DB directly here
    const { data: tokenRecord } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('jwt_id', refreshToken)
      .maybeSingle();

    if (!tokenRecord) {
      return next(createApiError(401, 'Invalid refresh token'));
    }

    if (tokenRecord.is_revoked) {
      return next(createApiError(401, `Refresh token is revoked`));
    }

    if (tokenRecord.is_expired || new Date(tokenRecord.expires_at) < new Date()) {
      return next(createApiError(401, 'Refresh token expired'));
    }

    // Attach to request for the controller to use
    (req as any).refreshTokenRecord = tokenRecord;
    next();
  } catch (error) {
    next(error);
  }
};
