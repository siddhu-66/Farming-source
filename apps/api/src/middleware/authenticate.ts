import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createApiError } from '../utils/apiError';

export interface AuthRequest extends Request { user?: { id: string; role: string; email: string; name: string; sessionId?: string; deviceId?: string; }; }
interface AgriAssistJwtPayload extends JwtPayload { userId: string; role: string; email: string; name?: string; sessionId?: string; deviceId?: string; }
const isPayload = (v: string | JwtPayload): v is AgriAssistJwtPayload => typeof v !== 'string' && typeof v.userId === 'string' && typeof v.role === 'string' && typeof v.email === 'string';

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
    try { decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }); }
    catch (err) { if (err instanceof jwt.TokenExpiredError) throw createApiError(401, 'Token expired. Please refresh your session.'); throw createApiError(401, 'Invalid token. Please log in again.'); }
    if (!isPayload(decoded)) throw createApiError(401, 'Invalid authentication claims.');
    req.user = { id: decoded.userId, role: decoded.role, email: decoded.email, name: decoded.name || 'User', sessionId: decoded.sessionId, deviceId: decoded.deviceId };
    next();
  } catch (error) { next(error); }
};
