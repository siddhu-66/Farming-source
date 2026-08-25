import { supabase } from '../config/supabase';
import { DatabaseError } from '../utils/errors';
import crypto from 'crypto';

export class SecurityEventsRepository {
  /**
   * Generates a public ID in the format SEC-<YYYY>-<RANDOM>
   */
  private generateSecurityId(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `SEC-${year}-${randomHex}`;
  }

  /**
   * Logs a new security event
   */
  async logEvent(data: Partial<any>) {
    const publicId = this.generateSecurityId();
    
    const { data: record, error } = await supabase.from('security_events').insert([{
      public_id: publicId,
      user_id: data.userId || null,
      login_history_id: data.loginHistoryId || null,
      session_id: data.sessionId || null,
      refresh_token_id: data.refreshTokenId || null,
      device_id: data.deviceId || null,
      audit_log_id: data.auditLogId || null,
      event_code: data.eventCode || 'SEC-UNKNOWN-000',
      event_type: data.eventType || 'ANOMALOUS_ACTIVITY',
      severity: data.severity || 'LOW',
      status: data.status || 'OPEN',
      title: data.title || 'Security Event',
      description: data.description || '',
      source: data.source || 'Authentication Service',
      category: data.category || 'AUTHENTICATION',
      ip_address: data.ipAddress || '0.0.0.0',
      browser: data.browser || null,
      operating_system: data.operatingSystem || null,
      device_type: data.deviceType || null,
      platform: data.platform || null,
      user_agent: data.userAgent || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      risk_score: data.riskScore || 0,
      confidence_score: data.confidenceScore || 100,
      detection_method: data.detectionMethod || 'System',
      response_action: data.responseAction || 'NONE',
      occurred_at: new Date().toISOString(),
      metadata: data.metadata || null,
      version: 1
    }]).select().single();

    if (error) {
      throw new DatabaseError(error.message);
    }
    return record;
  }

  /**
   * Fetch all security events for a user
   */
  async getUserSecurityEvents(userId: string) {
    const { data, error } = await supabase.from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false });

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  /**
   * Fetch security event details
   */
  async getEventById(eventId: string) {
    const { data, error } = await supabase.from('security_events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  /**
   * Admin: List all events
   */
  async getAdminEvents(filters: any = {}) {
    let query = supabase.from('security_events').select('*').order('occurred_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.category) query = query.eq('category', filters.category);

    const { data, error } = await query;
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  /**
   * Admin: Acknowledge an event
   */
  async acknowledgeEvent(eventId: string, adminId: string) {
    const { error } = await supabase.from('security_events').update({
      status: 'ACKNOWLEDGED',
      acknowledged_by: adminId,
      acknowledged_at: new Date().toISOString()
    }).eq('id', eventId);

    if (error) throw new DatabaseError(error.message);
  }

  /**
   * Admin: Resolve an event
   */
  async resolveEvent(eventId: string, adminId: string, resolutionNotes: string, adminAction: string) {
    const { error } = await supabase.from('security_events').update({
      status: 'RESOLVED',
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
      admin_action: adminAction
    }).eq('id', eventId);

    if (error) throw new DatabaseError(error.message);
  }
}

export default new SecurityEventsRepository();
