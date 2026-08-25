import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createApiError } from '../utils/apiError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
    sessionId?: string;
    deviceId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      throw createApiError(401, 'Authentication required. Please log in.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw createApiError(401, 'Token expired. Please refresh your session.');
      }
      throw createApiError(401, 'Invalid token. Please log in again.');
    }

    // Attach basic claims. The full DB check is handled in `accountStatus.ts`
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name || 'User',
      sessionId: decoded.sessionId,
      deviceId: decoded.deviceId
    };

    next();
  } catch (error) {
    next(error);
  }
};
