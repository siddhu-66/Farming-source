import { supabase } from '../config/supabase';
import { DatabaseError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { generatePublicId } from '../utils/generatePublicId';
import bcrypt from 'bcryptjs';

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;

export class OtpRequestsRepository {
  /**
   * Generates a numeric OTP of specified length.
   */
  private generateNumericOTP(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Request a new OTP. Handles invalidating previous ones for the same purpose.
   */
  async createOtpRequest(data: {
    phone: string;
    purpose: string;
    channel?: string;
    user_id?: string;
    request_ip?: string;
    request_device?: string;
    country_code?: string;
  }) {
    // 1. Invalidate previous active OTPs for the same mobile and purpose
    await supabase
      .from('otp_requests')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('phone', data.phone)
      .eq('purpose', data.purpose)
      .in('status', ['GENERATED', 'SENT', 'DELIVERED']);

    // 2. Generate new OTP
    const rawOtp = this.generateNumericOTP(OTP_LENGTH);
    const otpHash = await bcrypt.hash(rawOtp, 12);

    // 3. Determine Expiration based on purpose (in minutes)
    let expiryMinutes = 5; // Default for LOGIN
    if (data.purpose === 'REGISTER' || data.purpose === 'PASSWORD_RESET') expiryMinutes = 10;
    if (data.purpose === 'ADMIN_VERIFICATION') expiryMinutes = 3;
    if (data.purpose === 'TWO_FACTOR_AUTH') expiryMinutes = 2;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    const recordData = {
      public_id: generatePublicId('OTP'),
      phone: data.phone,
      user_id: data.user_id || null,
      otp_hash: otpHash,
      otp_length: OTP_LENGTH,
      purpose: data.purpose,
      channel: data.channel || 'SMS',
      status: 'GENERATED', // Typically changes to SENT after Twilio succeeds
      request_ip: data.request_ip || null,
      request_device: data.request_device || null,
      country_code: data.country_code || '+91',
      expires_at: expiresAt.toISOString(),
      resend_count: 0,
      verification_attempts: 0,
      max_attempts: MAX_ATTEMPTS,
      max_resend_limit: MAX_RESENDS,
      version: 1,
    };

    const { data: insertedData, error } = await supabase
      .from('otp_requests')
      .insert([recordData])
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);

    // RETURN THE RAW OTP SO TWILIO CAN SEND IT, BUT DON'T LOG IT
    return { record: insertedData, rawOtp };
  }

  /**
   * Updates Twilio SID and status to SENT/DELIVERED
   */
  async updateOtpDeliveryStatus(id: string, status: string, twilioSid?: string) {
    const { data, error } = await supabase
      .from('otp_requests')
      .update({ status, twilio_message_sid: twilioSid, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new DatabaseError(error.message);
    return data;
  }

  /**
   * Resend an OTP. Validates resend limits and cooldowns.
   */
  async resendOtp(phone: string, purpose: string) {
    // 1. Get the most recent OTP request for this purpose
    const { data: lastOtp, error } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('phone', phone)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    if (!lastOtp) throw new NotFoundError('No previous OTP request found to resend.');

    // 2. Enforce limits
    if (lastOtp.resend_count >= lastOtp.max_resend_limit) {
      throw new BusinessRuleError('Maximum resend limit reached. Please try again later.');
    }

    // Cooldown check (30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const lastCreatedAt = new Date(lastOtp.created_at || '');
    if (lastCreatedAt > thirtySecondsAgo) {
      throw new BusinessRuleError('Please wait 30 seconds before requesting another OTP.');
    }

    // 3. Create a brand new OTP record (copying context), incrementing resend count
    const { record, rawOtp } = await this.createOtpRequest({
      phone: lastOtp.phone,
      purpose: lastOtp.purpose,
      channel: lastOtp.channel,
      user_id: lastOtp.user_id || undefined,
      request_ip: lastOtp.request_ip || undefined,
      request_device: lastOtp.request_device || undefined,
      country_code: lastOtp.country_code || undefined,
    });

    // Update the new record's resend count to match the old + 1
    const { data: updatedRecord, error: updateError } = await supabase
      .from('otp_requests')
      .update({ resend_count: lastOtp.resend_count + 1 })
      .eq('id', record.id)
      .select()
      .single();

    if (updateError) throw new DatabaseError(updateError.message);

    return { record: updatedRecord, rawOtp };
  }

  /**
   * Verify an OTP. Handles hash comparison, attempts tracking, and statuses.
   */
  async verifyOtp(phone: string, purpose: string, rawOtp: string) {
    // Find the currently active OTP. Only one should exist due to our invalidation logic.
    const { data: otpRecord, error } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('phone', phone)
      .eq('purpose', purpose)
      .in('status', ['GENERATED', 'SENT', 'DELIVERED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new DatabaseError(error.message);
    if (!otpRecord) throw new NotFoundError('No active OTP found. Please request a new one.');

    // 1. Expiry Check (Logical Expiration)
    const now = new Date();
    if (new Date(otpRecord.expires_at) < now) {
      await this.markOtpFailed(otpRecord.id, 'EXPIRED');
      throw new BusinessRuleError('OTP has expired.');
    }

    // 2. Attempts Check
    if (otpRecord.verification_attempts >= otpRecord.max_attempts) {
      await this.markOtpFailed(otpRecord.id, 'BLOCKED', 'MAX_ATTEMPTS');
      throw new BusinessRuleError('Maximum verification attempts reached. OTP blocked.');
    }

    // 3. Hash Comparison
    const isValid = await bcrypt.compare(rawOtp, otpRecord.otp_hash);

    if (!isValid) {
      const newAttempts = otpRecord.verification_attempts + 1;
      let newStatus = otpRecord.status;
      let failReason = null;

      if (newAttempts >= otpRecord.max_attempts) {
        newStatus = 'BLOCKED';
        failReason = 'MAX_ATTEMPTS';
      }

      await supabase
        .from('otp_requests')
        .update({
          verification_attempts: newAttempts,
          status: newStatus,
          failure_reason: failReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', otpRecord.id);

      throw new BusinessRuleError('Invalid OTP.');
    }

    // 4. Success!
    const { data: successRecord, error: successError } = await supabase
      .from('otp_requests')
      .update({
        status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)
      .select()
      .single();

    if (successError) throw new DatabaseError(successError.message);
    return successRecord;
  }

  /**
   * Helper to mark OTP as failed/expired/blocked.
   */
  private async markOtpFailed(id: string, status: string, reason?: string) {
    await supabase
      .from('otp_requests')
      .update({
        status,
        failure_reason: reason || status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
  }
}

export default new OtpRequestsRepository();
