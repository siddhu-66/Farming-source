import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from './errorHandler';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const authorizePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createApiError(401, 'Authentication required'));
      }

      // If user is an admin, they typically have all permissions, but let's query DB
      const { data: roleData } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', req.user.role)
        .single();

      if (!roleData) {
        return next(createApiError(403, 'Invalid role assignment'));
      }

      const { data: permissionData } = await supabase
        .from('permissions')
        .select('id')
        .eq('code', permission)
        .single();

      if (!permissionData) {
        return next(createApiError(403, 'Permission does not exist'));
      }

      const { data: rolePermission } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleData.id)
        .eq('permission_id', permissionData.id)
        .maybeSingle();

      if (!rolePermission) {
        logger.warn(`Unauthorized permission attempt by ${req.user.email} for ${permission}`);
        
        // Log to audit_logs
        await supabase.from('audit_logs').insert([{
          user_id: req.user.id,
          action: `Unauthorized permission access attempt: required ${permission}`,
          entity: 'Route',
          entity_id: req.path,
          metadata: { ip_address: req.ip, user_agent: req.headers['user-agent'] }
        }]);

        return next(createApiError(403, 'You do not have permission to perform this action.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
