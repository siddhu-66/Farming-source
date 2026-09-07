import twilio from 'twilio';
import { logger } from '../config/logger';
let client: twilio.Twilio | null = null;
const getTwilioClient = () => { if (client) return client; const sid = process.env.TWILIO_ACCOUNT_SID; const token = process.env.TWILIO_AUTH_TOKEN; if (sid?.startsWith('AC') && token) { client = twilio(sid, token); return client; } return null; };
const normalizePhone = (phone: string) => { const cleaned = phone.replace(/[\s-]/g, ''); return cleaned.startsWith('+') ? cleaned : `+91${cleaned}`; };
export const sendSMS = async (to: string, message: string): Promise<void> => {
  const phone = normalizePhone(to);
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SMS_SIMULATOR === 'true') { logger.warn(`[DEV SMS SIMULATOR] SMS skipped for ${phone.slice(0, 4)}****. Message content omitted.`); return; }
      throw new Error('SMS provider is not configured');
    }
    const result = await twilioClient.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
    logger.info(`SMS sent to ${phone.slice(0, 4)}****: ${result.sid}`);
  } catch (error) { logger.error('Twilio SMS delivery failed', error); throw error; }
};
