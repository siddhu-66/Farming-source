import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from '../utils/apiError';
import { supabase } from '../config/supabase';

export const validateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.sessionId) {
      return next(createApiError(401, 'Session information missing in token'));
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('status, expires_at')
      .eq('id', req.user.sessionId)
      .maybeSingle();

    if (!session) {
      return next(createApiError(401, 'Invalid session'));
    }

    if (session.status !== 'active') {
      return next(createApiError(401, `Session is ${session.status}. Please log in again.`));
    }

    if (new Date(session.expires_at) < new Date()) {
      return next(createApiError(401, 'Session expired. Please log in again.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
