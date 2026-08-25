import { Resend } from 'resend';
import { logger } from '../config/logger';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock123456789');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'AgriAssist <noreply@agriassist.in>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      logger.error('Resend email error:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    logger.info(`Email sent to ${options.to}: ${data?.id}`);
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};
