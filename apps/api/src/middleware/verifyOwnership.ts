import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { createApiError } from './errorHandler';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const verifyOwnership = (tableName: string, foreignKeyColumn: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        return next(createApiError(401, 'Authentication required'));
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return next(createApiError(400, 'Resource ID is required for ownership verification'));
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(foreignKeyColumn)
        .eq('id', resourceId)
        .maybeSingle();

      if (error) {
        logger.error(`Ownership check failed: ${error.message}`);
        return next(createApiError(500, 'Error verifying resource ownership'));
      }

      if (!data) {
        return next(createApiError(404, 'Resource not found'));
      }

      // Check if the foreign key column matches the current user's ID
      if ((data as Record<string, any>)[foreignKeyColumn] !== req.user.id) {
        // Log to audit_logs for unauthorized attempt
        await supabase.from('audit_logs').insert([{
          user_id: req.user.id,
          action: `Ownership bypass attempt on ${tableName}`,
          entity: tableName,
          entity_id: resourceId,
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
