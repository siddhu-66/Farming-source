import twilio from 'twilio';
import { logger } from '../config/logger';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, message: string): Promise<void> => {
  try {
    const normalizedPhone = to.startsWith('+') ? to : `+91${to}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    logger.info(`SMS sent to ${normalizedPhone}: ${result.sid}`);
  } catch (error) {
    logger.error('Twilio SMS error:', error);
    throw error;
  }
};
