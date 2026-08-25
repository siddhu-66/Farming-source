import { supabase } from '../config/supabase';
import { DatabaseError } from '../utils/errors';

export interface AuditEvent {
  user_id?: string;
  role?: string;
  module: string;
  action: string;
  resource?: string;
  ip_address?: string;
  device_info?: string;
  result: 'SUCCESS' | 'FAILURE';
  correlation_id?: string;
  risk_level?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: any;
}

export class AuditService {
  /**
   * Logs a critical event to the centralized audit_logs table.
   */
  static async logEvent(event: AuditEvent): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert([{
        user_id: event.user_id,
        role: event.role || 'SYSTEM',
        module: event.module,
        action: event.action,
        resource: event.resource,
        ip_address: event.ip_address,
        device_info: event.device_info,
        result: event.result,
        correlation_id: event.correlation_id,
        risk_level: event.risk_level || 'INFO',
        metadata: event.metadata || {}
      }]);
      
      if (error) {
        console.error('Audit Log Error:', error);
      }
    } catch (err) {
      console.error('Audit Log Exception:', err);
    }
  }

  /**
   * Generates a request-level correlation ID if one doesn't exist.
   */
  static generateCorrelationId(): string {
    return `req-${Math.random().toString(36).substring(2, 15)}`;
  }
}

export default AuditService;
