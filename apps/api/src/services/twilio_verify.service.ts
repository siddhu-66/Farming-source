import twilio from 'twilio';
import { logger } from '../config/logger';
import { BusinessRuleError, ValidationError } from '../utils/errors';
import { normalizeToE164 } from '../utils/phone';

export interface VerificationStartResult {
  sid: string;
  status: string;
  to: string;
  channel: string;
  valid: boolean;
}

export interface VerificationCheckResult {
  sid: string;
  status: 'approved' | 'pending' | 'canceled';
  to: string;
  valid: boolean;
}

export class TwilioVerifyService {
  private client: twilio.Twilio | null = null;

  private getClient(): { client: twilio.Twilio; serviceSid: string } {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

    if (!accountSid || !authToken || !serviceSid) {
      logger.error('Twilio Verify configuration is incomplete. Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_VERIFY_SERVICE_SID.');
      throw new BusinessRuleError('SMS verification service is currently unconfigured. Please contact support.');
    }

    if (!accountSid.startsWith('AC')) {
      logger.error(`Invalid TWILIO_ACCOUNT_SID: must start with "AC". Got: ${accountSid.slice(0, 4)}...`);
      throw new BusinessRuleError('SMS verification service configuration error.');
    }

    if (!this.client) {
      this.client = twilio(accountSid, authToken);
    }

    return { client: this.client, serviceSid };
  }

  /**
   * Dispatches an OTP verification code to a mobile number via SMS using Twilio Verify API v2.
   * Phone must be normalized to E.164.
   */
  async startVerification(phone: string, channel: 'sms' | 'call' = 'sms'): Promise<VerificationStartResult> {
    const normalizedPhone = normalizeToE164(phone);
    const { client, serviceSid } = this.getClient();

    try {
      logger.info(`[Twilio Verify] Requesting SMS verification for ${normalizedPhone.slice(0, 3)}****${normalizedPhone.slice(-4)}`);

      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications
        .create({
          to: normalizedPhone,
          channel: channel,
        });

      logger.info(`[Twilio Verify] Verification initiated. SID: ${verification.sid}, status: ${verification.status}`);

      return {
        sid: verification.sid,
        status: verification.status,
        to: verification.to,
        channel: verification.channel,
        valid: verification.valid ?? true,
      };
    } catch (error: any) {
      logger.error(`[Twilio Verify] Verification creation failed:`, {
        code: error.code,
        status: error.status,
        message: error.message,
      });

      // Handle specific Twilio Verify error codes
      if (error.code === 60200) {
        throw new ValidationError(`Invalid mobile phone number format for SMS delivery.`);
      }
      if (error.code === 60203) {
        throw new BusinessRuleError('Maximum send attempts reached for this phone number. Please try again later.');
      }
      if (error.code === 20429 || error.status === 429) {
        throw new BusinessRuleError('Too many SMS verification requests. Please wait a few minutes before retrying.');
      }

      throw new BusinessRuleError(
        error.message && !error.message.includes('Authenticate')
          ? error.message
          : 'Unable to send SMS verification code. Please check your phone number and try again.'
      );
    }
  }

  /**
   * Validates an OTP code entered by the user using Twilio Verify API v2.
   * Returns verification result with status 'approved' on success.
   */
  async checkVerification(phone: string, code: string): Promise<VerificationCheckResult> {
    const normalizedPhone = normalizeToE164(phone);
    const trimmedCode = (code || '').trim();

    if (!trimmedCode || trimmedCode.length < 4 || trimmedCode.length > 10) {
      throw new ValidationError('A valid verification code must be provided.');
    }

    const { client, serviceSid } = this.getClient();

    try {
      logger.info(`[Twilio Verify] Checking OTP code for ${normalizedPhone.slice(0, 3)}****${normalizedPhone.slice(-4)}`);

      const check = await client.verify.v2
        .services(serviceSid)
        .verificationChecks
        .create({
          to: normalizedPhone,
          code: trimmedCode,
        });

      logger.info(`[Twilio Verify] Verification check result: SID: ${check.sid}, status: ${check.status}`);

      return {
        sid: check.sid,
        status: check.status as 'approved' | 'pending' | 'canceled',
        to: check.to,
        valid: check.valid ?? (check.status === 'approved'),
      };
    } catch (error: any) {
      logger.error(`[Twilio Verify] Verification check failed:`, {
        code: error.code,
        status: error.status,
        message: error.message,
      });

      // Twilio error 20404: The requested resource was not found (expired, already verified, or max attempts reached)
      if (error.code === 20404 || error.status === 404) {
        throw new BusinessRuleError(
          'Verification code has expired or was not found. Please click "Resend OTP" to receive a new code.'
        );
      }

      // Twilio error 60202: Max verification check attempts reached
      if (error.code === 60202) {
        throw new BusinessRuleError(
          'Maximum verification attempts reached for this code. Please request a new OTP.'
        );
      }

      if (error.code === 20429 || error.status === 429) {
        throw new BusinessRuleError('Too many verification attempts. Please wait before retrying.');
      }

      throw new BusinessRuleError(
        error.message && !error.message.includes('Authenticate')
          ? error.message
          : 'Failed to verify code. Please check the code and try again.'
      );
    }
  }
}

export const twilioVerifyService = new TwilioVerifyService();
export default twilioVerifyService;
