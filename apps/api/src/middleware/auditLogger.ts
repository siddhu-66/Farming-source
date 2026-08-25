import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { supabase } from '../config/supabase';

/**
 * Automatically logs mutation actions (POST, PUT, PATCH, DELETE) to the audit_logs table.
 */
export const auditLogger = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Capture the original end function to log after response is sent
  const originalEnd = res.end;
  
  res.end = function (chunk?: any, encoding?: any, cb?: any): any {
    // Call the original response end
    originalEnd.call(this, chunk, encoding, cb);

    // Only log mutations (ignoring GET and OPTIONS)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (req.user && req.user.id) {
        supabase.from('audit_logs').insert([{
          user_id: req.user.id,
          action: `${req.method} ${req.route?.path || req.path}`,
          entity: req.baseUrl.split('/').pop() || 'Unknown',
          entity_id: req.params.id || null,
          metadata: {
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            status_code: res.statusCode
          }
        }]).then(({ error }) => {
          if (error) console.error('Failed to write audit log:', error);
        });
      }
    }
  };

  next();
};
