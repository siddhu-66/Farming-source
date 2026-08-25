import { supabase } from '../config/supabase';
import { DatabaseError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class RefreshTokensRepository {
  /**
   * Issues a new refresh token and stores the hash in the database.
   */
  async issueToken(data: {
    userId: string;
    sessionId: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    operatingSystem?: string;
    deviceType?: string;
    platform?: string;
  }) {
    // Generate raw token and JTI
    const rawToken = uuidv4() + '-' + uuidv4(); // Highly secure random string
    const jwtId = uuidv4();
    const tokenHash = await bcrypt.hash(rawToken, 12);

    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 Days expiration

    const recordData = {
      public_id: generatePublicId('RFT'),
      user_id: data.userId,
      session_id: data.sessionId,
      device_id: data.deviceId || null,
      token_hash: tokenHash,
      jwt_id: jwtId,
      token_version: 1,
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      browser: data.browser || null,
      operating_system: data.operatingSystem || null,
      device_type: data.deviceType || null,
      platform: data.platform || null,
      is_revoked: false,
      is_expired: false,
      is_compromised: false,
      version: 1,
    };

    const { data: insertedData, error } = await supabase
      .from('refresh_tokens')
      .insert([recordData])
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);

    return {
      record: insertedData,
      rawToken, // RETURNED ONLY ONCE TO THE CLIENT
      jwtId,
    };
  }

  /**
   * Rotates a refresh token.
   * If the old token is already revoked, it marks it compromised and logs out the user everywhere.
   */
  async rotateToken(userId: string, jwtId: string, rawToken: string, requestMeta: any) {
    // 1. Find the token by JTI
    const { data: tokenRecord, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('jwt_id', jwtId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    if (!tokenRecord) {
      throw new BusinessRuleError('Invalid token. Please log in again.');
    }

    // 2. Hash Comparison
    const isValid = await bcrypt.compare(rawToken, tokenRecord.token_hash);
    if (!isValid) {
      throw new BusinessRuleError('Invalid token signature. Please log in again.');
    }

    // 3. Expiration Check
    if (new Date(tokenRecord.expires_at) < new Date() || tokenRecord.is_expired) {
      // Mark logically expired just in case
      await supabase.from('refresh_tokens').update({ is_expired: true }).eq('id', tokenRecord.id);
      throw new BusinessRuleError('Session expired. Please log in again.');
    }

    // 4. Compromise / Replay Attack Detection
    if (tokenRecord.is_revoked) {
      // REPLAY ATTACK DETECTED!
      // The token was already revoked, but someone is trying to use it again!
      
      // A. Mark this specific token as compromised
      await supabase
        .from('refresh_tokens')
        .update({ 
          is_compromised: true, 
          revoke_reason: 'SECURITY_BREACH_REPLAY',
          updated_at: new Date().toISOString() 
        })
        .eq('id', tokenRecord.id);

      // B. Revoke ALL active tokens for this user to lock down the account
      await this.revokeAllTokens(userId, 'SECURITY_BREACH');

      throw new BusinessRuleError('Security breach detected. All sessions have been terminated. Please log in again.');
    }

    // 5. Revoke the OLD token legitimately (Token Rotation)
    await supabase
      .from('refresh_tokens')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoke_reason: 'TOKEN_ROTATED',
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenRecord.id);

    // 6. Issue a NEW token (Inheriting session & device)
    const newToken = await this.issueToken({
      userId,
      sessionId: tokenRecord.session_id,
      deviceId: tokenRecord.device_id || undefined,
      ...requestMeta
    });

    // Update version on new token
    await supabase
      .from('refresh_tokens')
      .update({ token_version: tokenRecord.token_version + 1 })
      .eq('id', newToken.record.id);

    return newToken;
  }

  /**
   * Revoke a specific token (Logout Current Device)
   */
  async revokeToken(jwtId: string, reason: string = 'LOGOUT') {
    const { error } = await supabase
      .from('refresh_tokens')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoke_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('jwt_id', jwtId)
      .eq('is_revoked', false);

    if (error) throw new DatabaseError(error.message);
  }

  /**
   * Revoke all tokens for a user (Logout All Devices)
   */
  async revokeAllTokens(userId: string, reason: string = 'LOGOUT_ALL') {
    const { error } = await supabase
      .from('refresh_tokens')
      .update({
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoke_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_revoked', false);

    if (error) throw new DatabaseError(error.message);
  }
}

export default new RefreshTokensRepository();
