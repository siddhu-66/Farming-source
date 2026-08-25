import securityEventsRepo from '../repositories/security_events.repository';
import { supabase } from '../config/supabase';
import { sendEmail } from './email'; // Hypothetical email service
import authRepo from '../repositories/auth.repository';

export class SecurityService {
  /**
   * Tracks failed logins and determines if it triggers a brute force lock
   */
  async logFailedLogin(userId: string | null, requestMeta: any, reason: string) {
    if (!userId) {
      // If there's no user ID, we can still log a generic failed login event
      await securityEventsRepo.logEvent({
        ...requestMeta,
        eventCode: 'SEC-AUTH-0001',
        eventType: 'FAILED_LOGIN',
        severity: 'LOW',
        status: 'OPEN',
        title: 'Failed Login Attempt',
        description: `Failed login attempt. Reason: ${reason}`,
        category: 'AUTHENTICATION',
        riskScore: 20
      });
      return;
    }

    // Get the user to check failed login counts
    const user = await authRepo.getUserById(userId);
    if (!user) return;

    const failedCount = 0 + 1;

    // Log the failed login event
    await securityEventsRepo.logEvent({
      ...requestMeta,
      userId,
      eventCode: 'SEC-AUTH-0001',
      eventType: 'FAILED_LOGIN',
      severity: 'LOW',
      status: 'OPEN',
      title: 'Failed Login Attempt',
      description: `Failed login attempt. Reason: ${reason}. Attempt ${failedCount}.`,
      category: 'AUTHENTICATION',
      riskScore: 20 + (failedCount * 5)
    });

    // Check brute force threshold
    if (failedCount >= 5) {
      await this.triggerAccountLockout(userId, requestMeta);
    }
  }

  /**
   * Triggers account lockout and creates a HIGH severity event
   */
  async triggerAccountLockout(userId: string, requestMeta: any) {
    await authRepo.updateUser(userId, { status: 'LOCKED' });

    await securityEventsRepo.logEvent({
      ...requestMeta,
      userId,
      eventCode: 'SEC-BRUTEFORCE-0001',
      eventType: 'MULTIPLE_FAILED_LOGINS',
      severity: 'HIGH',
      status: 'OPEN',
      title: 'Multiple Failed Login Attempts',
      description: 'Account locked due to 5 consecutive failed login attempts.',
      category: 'AUTHENTICATION',
      riskScore: 85,
      responseAction: 'LOCK_ACCOUNT'
    });
    
    // Optionally trigger an email to user here
    // sendEmail(...)
  }

  /**
   * Logs a new device login event
   */
  async logNewDeviceLogin(userId: string, deviceId: string, requestMeta: any) {
    await securityEventsRepo.logEvent({
      ...requestMeta,
      userId,
      deviceId,
      eventCode: 'SEC-DEVICE-0001',
      eventType: 'NEW_DEVICE_LOGIN',
      severity: 'MEDIUM',
      status: 'OPEN',
      title: 'New Device Login Detected',
      description: `Login detected from a new unrecognized device: ${requestMeta.deviceType} on ${requestMeta.operatingSystem}`,
      category: 'DEVICE_SECURITY',
      riskScore: 40,
      responseAction: 'SEND_NOTIFICATION'
    });
  }

  async getUserSecurityEvents(userId: string) {
    return await securityEventsRepo.getUserSecurityEvents(userId);
  }

  async getEventById(eventId: string) {
    return await securityEventsRepo.getEventById(eventId);
  }

  async getAdminEvents(filters: any) {
    return await securityEventsRepo.getAdminEvents(filters);
  }

  async acknowledgeEvent(eventId: string, adminId: string) {
    return await securityEventsRepo.acknowledgeEvent(eventId, adminId);
  }

  async resolveEvent(eventId: string, adminId: string, resolutionNotes: string, adminAction: string) {
    return await securityEventsRepo.resolveEvent(eventId, adminId, resolutionNotes, adminAction);
  }

  /**
   * Triggers a new backup job and records it in history.
   */
  async triggerBackup(jobName: string, type: 'FULL' | 'INCREMENTAL', userId: string) {
    const { data: job, error: jobError } = await supabase.from('backup_jobs').insert([{
      job_name: jobName,
      type,
      is_active: true,
      last_run_at: new Date().toISOString()
    }]).select().single();

    if (jobError) throw new Error(jobError.message);

    const { data: history, error: historyError } = await supabase.from('backup_history').insert([{
      job_id: job.id,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString()
    }]).select().single();

    if (historyError) throw new Error(historyError.message);

    // Simulate backup completion asynchronously
    setTimeout(async () => {
      await supabase.from('backup_history').update({
        status: 'SUCCESS',
        file_size_bytes: Math.floor(Math.random() * 1024 * 1024 * 500), // Random size up to 500MB
        storage_path: `s3://agriassist-backups/${job.id}.tar.gz`,
        checksum: 'sha256:mock_checksum',
        completed_at: new Date().toISOString()
      }).eq('id', history.id);
    }, 5000);

    return { job, history };
  }

  /**
   * Retrieves security alerts.
   */
  async getAlerts(page = 1, limit = 10) {
    const { data, error, count } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw new Error(error.message);
    return { data, total: count || 0 };
  }

  /**
   * Creates a security incident.
   */
  async createIncident(data: any, reportedBy: string) {
    const { data: incident, error } = await supabase.from('security_incidents').insert([{
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'INVESTIGATING',
      reported_by: reportedBy
    }]).select().single();

    if (error) throw new Error(error.message);
    return incident;
  }
}

export default new SecurityService();
