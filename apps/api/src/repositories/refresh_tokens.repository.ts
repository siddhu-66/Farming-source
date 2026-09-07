import { supabase } from '../config/supabase';
import { DatabaseError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class RefreshTokensRepository {
  async issueToken(data: { userId: string; sessionId: string; deviceId?: string; ipAddress?: string; userAgent?: string; browser?: string; operatingSystem?: string; deviceType?: string; platform?: string; }) {
    const rawToken = uuidv4() + '-' + uuidv4();
    const jwtId = uuidv4();
    const tokenHash = await bcrypt.hash(rawToken, 12);
    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const recordData = {
      public_id: generatePublicId('RFT'), user_id: data.userId, session_id: data.sessionId, device_id: data.deviceId || null,
      token_hash: tokenHash, jwt_id: jwtId, token_version: 1, issued_at: issuedAt.toISOString(), expires_at: expiresAt.toISOString(),
      ip_address: data.ipAddress || null, user_agent: data.userAgent || null, browser: data.browser || null,
      operating_system: data.operatingSystem || null, device_type: data.deviceType || null, platform: data.platform || null,
      is_revoked: false, is_expired: false, is_compromised: false, version: 1,
    };
    const { data: insertedData, error } = await supabase.from('refresh_tokens').insert([recordData]).select().single();
    if (error) throw new DatabaseError(error.message);
    return { record: insertedData, rawToken, jwtId };
  }

  async rotateToken(userId: string, jwtId: string, rawToken: string, requestMeta: any) {
    const { data: tokenRecord, error } = await supabase.from('refresh_tokens').select('*').eq('jwt_id', jwtId).eq('user_id', userId).maybeSingle();
    if (error) throw new DatabaseError(error.message);
    if (!tokenRecord) throw new BusinessRuleError('Invalid token. Please log in again.');

    const isValid = await bcrypt.compare(rawToken, tokenRecord.token_hash);
    if (!isValid) throw new BusinessRuleError('Invalid token signature. Please log in again.');

    if (new Date(tokenRecord.expires_at) < new Date() || tokenRecord.is_expired) {
      await supabase.from('refresh_tokens').update({ is_expired: true }).eq('id', tokenRecord.id);
      throw new BusinessRuleError('Session expired. Please log in again.');
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, session_status, expires_at, idle_timeout_at')
      .eq('id', tokenRecord.session_id)
      .eq('user_id', userId)
      .maybeSingle();
    if (sessionError) throw new DatabaseError(sessionError.message);
    if (!session || session.session_status !== 'ACTIVE') throw new BusinessRuleError('Session is no longer active. Please log in again.');
    const now = new Date();
    if (session.expires_at && new Date(session.expires_at) <= now) throw new BusinessRuleError('Session expired. Please log in again.');
    if (session.idle_timeout_at && new Date(session.idle_timeout_at) <= now) throw new BusinessRuleError('Session timed out. Please log in again.');

    if (tokenRecord.is_revoked) {
      await supabase.from('refresh_tokens').update({ is_compromised: true, revoke_reason: 'SECURITY_BREACH_REPLAY', updated_at: now.toISOString() }).eq('id', tokenRecord.id);
      await this.revokeAllTokens(userId, 'SECURITY_BREACH');
      throw new BusinessRuleError('Security breach detected. All sessions have been terminated. Please log in again.');
    }

    const { error: revokeError } = await supabase.from('refresh_tokens').update({ is_revoked: true, revoked_at: now.toISOString(), revoke_reason: 'TOKEN_ROTATED', last_used_at: now.toISOString(), updated_at: now.toISOString() }).eq('id', tokenRecord.id).eq('is_revoked', false);
    if (revokeError) throw new DatabaseError(revokeError.message);

    const newToken = await this.issueToken({ userId, sessionId: tokenRecord.session_id, deviceId: tokenRecord.device_id || undefined, ...requestMeta });
    await supabase.from('refresh_tokens').update({ token_version: tokenRecord.token_version + 1 }).eq('id', newToken.record.id);
    return newToken;
  }

  async revokeToken(jwtId: string, reason: string = 'LOGOUT') {
    const { error } = await supabase.from('refresh_tokens').update({ is_revoked: true, revoked_at: new Date().toISOString(), revoke_reason: reason, updated_at: new Date().toISOString() }).eq('jwt_id', jwtId).eq('is_revoked', false);
    if (error) throw new DatabaseError(error.message);
  }

  async revokeAllTokens(userId: string, reason: string = 'LOGOUT_ALL') {
    const { error } = await supabase.from('refresh_tokens').update({ is_revoked: true, revoked_at: new Date().toISOString(), revoke_reason: reason, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('is_revoked', false);
    if (error) throw new DatabaseError(error.message);
  }
}

export default new RefreshTokensRepository();