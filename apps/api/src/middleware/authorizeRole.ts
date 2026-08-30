import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from './errorHandler';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createApiError(401, 'Authentication required'));
    }

    const userRole = (req.user.role || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    // Support transport/transporter alias
    if (allowedRoles.includes('TRANSPORT') && !allowedRoles.includes('TRANSPORTER')) {
      allowedRoles.push('TRANSPORTER');
    }
    if (allowedRoles.includes('TRANSPORTER') && !allowedRoles.includes('TRANSPORT')) {
      allowedRoles.push('TRANSPORT');
    }

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.path}`);

      // Log to audit_logs
      supabase.from('audit_logs').insert([{
        user_id: req.user.id,
        action: `Unauthorized role access attempt: required ${roles.join(' or ')}`,
        entity: 'Route',
        entity_id: req.path,
        metadata: { ip_address: req.ip, user_agent: req.headers['user-agent'] }
      }]).then(() => {}, () => {});

      return next(createApiError(403, 'You do not have permission to perform this action.'));
    }

    next();
  };
};
