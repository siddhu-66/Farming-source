import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createApiError } from '../utils/apiError';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string; name: string; sessionId?: string; deviceId?: string };
}
interface AgriAssistJwtPayload extends JwtPayload { userId: string; role: string; email: string; name?: string; sessionId?: string; deviceId?: string; }

const isPayload = (v: string | JwtPayload): v is AgriAssistJwtPayload =>
  typeof v !== 'string' && typeof v.userId === 'string' && typeof v.role === 'string' && typeof v.email === 'string';

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const cookieToken = req.cookies?.token as string | undefined;
    const token = bearerToken || cookieToken;
    if (!token) throw createApiError(401, 'Authentication required. Please log in.');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw createApiError(401, 'Token expired. Please refresh your session.');
      throw createApiError(401, 'Invalid token. Please log in again.');
    }
    if (!isPayload(decoded)) throw createApiError(401, 'Invalid authentication claims.');
    if (!decoded.sessionId) throw createApiError(401, 'Session is no longer valid. Please log in again.');

    const [{ data: user, error: userError }, { data: session, error: sessionError }] = await Promise.all([
      supabase.from('users').select('id, role, email, full_name, status, is_deleted').eq('id', decoded.userId).maybeSingle(),
      supabase.from('sessions').select('id, user_id, session_status, expires_at, idle_timeout_at').eq('id', decoded.sessionId).eq('user_id', decoded.userId).maybeSingle(),
    ]);

    if (userError || sessionError) throw new Error(userError?.message || sessionError?.message || 'Authentication lookup failed');
    if (!user || user.is_deleted || user.status !== 'ACTIVE') throw createApiError(401, 'Account is no longer active.');
    if (!session || session.session_status !== 'ACTIVE') throw createApiError(401, 'Session is no longer active. Please log in again.');

    const now = Date.now();
    const expiresAt = session.expires_at ? Date.parse(session.expires_at) : NaN;
    const idleTimeoutAt = session.idle_timeout_at ? Date.parse(session.idle_timeout_at) : NaN;
    if ((Number.isFinite(expiresAt) && expiresAt <= now) || (Number.isFinite(idleTimeoutAt) && idleTimeoutAt <= now)) {
      throw createApiError(401, 'Session has expired. Please log in again.');
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.full_name || 'User',
      sessionId: session.id,
      deviceId: decoded.deviceId,
    };
    next();
  } catch (error) {
    next(error);
  }
};
