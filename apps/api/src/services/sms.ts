import twilio from 'twilio';
import { logger } from '../config/logger';

let client: twilio.Twilio | null = null;

const getTwilioClient = () => {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (sid && sid.startsWith('AC') && token) {
    client = twilio(sid, token);
    return client;
  }
  return null;
};

export const sendSMS = async (to: string, message: string): Promise<void> => {
  try {
    const normalizedPhone = to.startsWith('+') ? to : `+91${to}`;
    const twilioClient = getTwilioClient();

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
      });
      logger.info(`SMS sent to ${normalizedPhone}: ${result.sid}`);
    } else {
      logger.warn(`[DEV SMS SIMULATOR] Twilio not configured or invalid credentials. SMS to ${normalizedPhone}: "${message}"`);
    }
  } catch (error) {
    logger.error('Twilio SMS error:', error);
    // In dev or fallback, don't break the user flow completely if SMS delivery fails
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};
