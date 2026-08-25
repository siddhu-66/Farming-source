import { supabase } from '../config/supabase';
import { DatabaseError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';
import crypto from 'crypto';

export class LoginHistoryRepository {
  async recordLoginAttempt(data: any) {
    const platform = (data.platform || 'WEB').toUpperCase();
    const loginId = `LOGIN-${platform}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const { data: record, error } = await supabase.from('login_history').insert([{
      public_id: generatePublicId('LGN'),
      user_id: data.userId || null,
      session_id: data.sessionId || null,
      refresh_token_id: data.refreshTokenId || null,
      device_id: data.deviceId || null,
      login_id: loginId,
      login_type: data.loginType || 'LOGIN',
      authentication_method: data.authenticationMethod || 'PASSWORD',
      login_status: data.loginStatus || 'FAILED',
      failure_reason: data.failureReason || null,
      otp_request_id: data.otpRequestId || null,
      ip_address: data.ipAddress || '0.0.0.0',
      browser: data.browser || 'Unknown',
      browser_version: data.browserVersion || null,
      operating_system: data.operatingSystem || 'Unknown',
      operating_system_version: data.operatingSystemVersion || null,
      device_type: data.deviceType || 'Desktop',
      platform: data.platform || 'Web',
      user_agent: data.userAgent || 'Unknown',
      screen_resolution: data.screenResolution || null,
      language: data.language || null,
      timezone: data.timezone || null,
      network_type: data.networkType || null,
      internet_provider: data.internetProvider || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      login_time: new Date().toISOString(),
      risk_score: data.riskScore || 0,
      suspicious_reason: data.suspiciousReason || null,
      is_trusted_device: data.isTrustedDevice || false,
      is_successful: data.isSuccessful || false,
      is_blocked: data.isBlocked || false,
      metadata: data.metadata || null,
      version: 1
    }]).select().single();

    if (error) {
      throw new DatabaseError(error.message);
    }
    return record;
  }

  async updateLogoutTime(sessionId: string) {
    const now = new Date();
    
    // Fetch the login history record associated with this session
    const { data: history } = await supabase.from('login_history')
      .select('id, login_time')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (history && history.login_time) {
      const loginTime = new Date(history.login_time);
      const durationSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

      const { error } = await supabase.from('login_history').update({
        logout_time: now.toISOString(),
        session_duration: durationSeconds,
        login_status: 'LOGGED_OUT'
      }).eq('id', history.id);

      if (error) throw new DatabaseError(error.message);
    }
  }

  async getUserLoginHistory(userId: string) {
    const { data, error } = await supabase.from('login_history')
      .select('*')
      .eq('user_id', userId)
      .order('login_time', { ascending: false });

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getLoginDetails(userId: string, historyId: string) {
    const { data, error } = await supabase.from('login_history')
      .select('*')
      .eq('user_id', userId)
      .eq('id', historyId)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    return data;
  }
}

export default new LoginHistoryRepository();
