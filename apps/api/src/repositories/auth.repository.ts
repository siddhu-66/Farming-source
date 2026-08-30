import { supabase } from '../config/supabase';
import { DatabaseError } from '../utils/errors';
import { logger } from '../config/logger';
import { generatePublicId } from '../utils/generatePublicId';
import crypto from 'crypto';

export class AuthRepository {
  async getUserByEmail(email: string) {
    if (!email) return null;
    const { data, error } = await supabase.from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getUserByPhone(phone: string, role?: string) {
    if (!phone) return null;
    const cleanPhone = phone.trim();
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    const tenDigit = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    const withPlus91 = `+91${tenDigit}`;
    const withPlus = `+${digitsOnly}`;

    let exactQuery = supabase.from('users').select('*').eq('is_deleted', false);
    if (role) exactQuery = exactQuery.eq('role', role);

    const { data: exactMatch } = await exactQuery.eq('phone', cleanPhone).limit(1).maybeSingle();
    if (exactMatch) return exactMatch;

    if (withPlus91 !== cleanPhone) {
      let q1 = supabase.from('users').select('*').eq('phone', withPlus91).eq('is_deleted', false);
      if (role) q1 = q1.eq('role', role);
      const { data: match1 } = await q1.limit(1).maybeSingle();
      if (match1) return match1;
    }

    if (withPlus !== cleanPhone && withPlus !== withPlus91) {
      let qPlus = supabase.from('users').select('*').eq('phone', withPlus).eq('is_deleted', false);
      if (role) qPlus = qPlus.eq('role', role);
      const { data: matchPlus } = await qPlus.limit(1).maybeSingle();
      if (matchPlus) return matchPlus;
    }

    if (tenDigit !== cleanPhone && tenDigit !== withPlus91) {
      let q2 = supabase.from('users').select('*').eq('phone', tenDigit).eq('is_deleted', false);
      if (role) q2 = q2.eq('role', role);
      const { data: match2 } = await q2.limit(1).maybeSingle();
      if (match2) return match2;
    }

    return null;
  }

  async deleteUserById(id: string) {
    try {
      await supabase.from('otp_requests').delete().eq('user_id', id);
      await supabase.from('sessions').delete().eq('user_id', id);
      await supabase.from('farmers').delete().eq('user_id', id);
      await supabase.from('buyers').delete().eq('user_id', id);
      await supabase.from('transporters').delete().eq('user_id', id);
      await supabase.from('industries').delete().eq('user_id', id);
      await supabase.from('admin_profiles').delete().eq('user_id', id);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        logger.warn(`Failed to hard delete user ${id}: ${error.message}`);
      }
    } catch (e) {
      logger.warn(`deleteUserById error:`, e);
    }
  }

  async getUserById(id: string) {
    const { data, error } = await supabase.from('users')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async createUser(userData: any) {
    const enrichedData = {
      ...userData,
      public_id: generatePublicId('USR'),
      status: 'PENDING',
      
      is_email_verified: false,
      is_mobile_verified: false,
      profile_completed: false,
      is_deleted: false,
      version: 1,
    };
    const { data, error } = await supabase.from('users').insert([enrichedData]).select().single();
    if (error) {
      logger.error('Supabase users insert error:', error);
      throw new DatabaseError(error.message, [error.details]);
    }
    return data;
  }

  async createRoleProfile(role: string, userId: string) {
    const tableMap: Record<string, string> = {
      farmer: 'farmers',
      buyer: 'buyers',
      transport: 'transporters',
      industry: 'industries',
      admin: 'admin_profiles'
    };
    const table = tableMap[role.toLowerCase()];
    if (!table) return;

    const { data: existing } = await supabase.from(table as any)
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (existing) return;

    if (table === 'admin_profiles') {
      const user = await this.getUserById(userId);
      const { error } = await supabase.from(table as any).insert([{
        user_id: userId,
        full_name: user?.full_name || 'Admin',
        designation: 'ADMIN',
        official_email: user?.email || '',
        mobile_number: user?.phone || ''
      }]);
      if (error) throw new DatabaseError(error.message);
    } else {
      const { error } = await supabase.from(table as any).insert([{ user_id: userId }]);
      if (error) throw new DatabaseError(error.message);
    }
  }

  async updateUser(id: string, updates: any) {
    const enrichedUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('users').update(enrichedUpdates).eq('id', id).select().single();
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async softDeleteUser(id: string, deletedBy: string) {
    const { error } = await supabase.from('users').update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
      status: 'ARCHIVED'
    }).eq('id', id);
    if (error) throw new DatabaseError(error.message);
  }

  async insertOtp(otpData: any) {
    const { error } = await supabase.from('otp_requests').insert([otpData]);
    if (error) throw new DatabaseError(error.message);
  }

  async deleteOtps(userId: string, type: string) {
    const { error } = await supabase.from('otp_requests').update({ status: 'INVALIDATED' }).eq('user_id', userId).eq('purpose', type);
    if (error) throw new DatabaseError(error.message);
  }

  async getValidOtp(userId: string) {
    const { data, error } = await supabase.from('otp_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async updateOtpAttempts(id: string, attempts: number) {
    // Note: Assuming we add an attempts column if needed, or handle differently. We'll ignore for now.
  }

  async markOtpUsed(id: string) {
    const { error } = await supabase.from('otp_requests').update({ status: 'VERIFIED', verified_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new DatabaseError(error.message);
  }

  async logAudit(userId: string, action: string, entity: string, metadata?: any) {
    await supabase.from('audit_logs').insert([{ user_id: userId, action, entity, metadata }]);
  }

  async logLogin(userId: string, status: string = 'success') {
    await supabase.from('login_history').insert([{
      user_id: userId,
      login_time: new Date().toISOString(),
      status
    }]);
  }

  async createSession(userId: string, meta: any = {}) {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('sessions').insert([{
      user_id: userId,
      session_code: crypto.randomBytes(8).toString('hex'),
      session_status: 'ACTIVE',
      login_method: 'password',
      login_time: now,
      last_activity_at: now,
      expires_at: expiresAt,
      idle_timeout_at: expiresAt,
      device_type: meta.deviceType || null,
      browser: meta.browser || null,
      ip_address: meta.ipAddress || null,
      city: meta.location || null
    }]).select().single();
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async updateSessionActivity(sessionId: string) {
    const { error } = await supabase.from('sessions').update({
      last_activity_at: new Date().toISOString()
    }).eq('id', sessionId);
    if (error) throw new DatabaseError(error.message);
  }

  async getActiveSessions(userId: string) {
    const { data, error } = await supabase.from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_status', 'ACTIVE')
      .order('last_activity_at', { ascending: false });
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async getSessionById(sessionId: string, userId: string) {
    const { data, error } = await supabase.from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new DatabaseError(error.message);
    return data;
  }

  async terminateSession(sessionId: string, userId: string, reason: string = 'USER_LOGOUT') {
    const { error } = await supabase.from('sessions').update({
      session_status: 'TERMINATED',
      logout_reason: reason,
      logout_time: new Date().toISOString()
    }).eq('id', sessionId).eq('user_id', userId);
    if (error) throw new DatabaseError(error.message);
  }

  async terminateAllSessions(userId: string, reason: string = 'USER_LOGOUT') {
    const { error } = await supabase.from('sessions').update({
      session_status: 'TERMINATED',
      logout_reason: reason,
      logout_time: new Date().toISOString()
    }).eq('user_id', userId).eq('session_status', 'ACTIVE');
    if (error) throw new DatabaseError(error.message);
  }

  async linkRefreshTokenToSession(sessionId: string, refreshTokenId: string) {
    const { error } = await supabase.from('sessions').update({
      refresh_token_id: refreshTokenId
    }).eq('id', sessionId);
    if (error) throw new DatabaseError(error.message);
  }

  async revokeSession(token: string) {
    await supabase.from('sessions').update({ session_status: 'TERMINATED' }).eq('refresh_token_id', token);
    await supabase.from('token_blacklist').insert([{ token }]);
  }

  async checkTokenBlacklist(token: string) {
    const { data, error } = await supabase.from('token_blacklist').select('id').eq('token', token).maybeSingle();
    if (error) throw new DatabaseError(error.message);
    return !!data;
  }
}

export default new AuthRepository();
