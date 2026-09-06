import axios from 'axios';
import crypto from 'crypto';

const getConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay credentials are not configured');
  return { keyId, keySecret, webhookSecret };
};

const client = () => {
  const { keyId, keySecret } = getConfig();
  return axios.create({
    baseURL: 'https://api.razorpay.com/v1',
    auth: { username: keyId, password: keySecret },
    timeout: 15000,
  });
};

export const createOrder = async (amountRupees: number, receipt: string, notes: Record<string, string> = {}) => {
  if (!Number.isFinite(amountRupees) || amountRupees <= 0) throw new Error('Invalid payment amount');
  const amount = Math.round(amountRupees * 100);
  if (amount <= 0) throw new Error('Payment amount is too small');
  const response = await client().post('/orders', { amount, currency: 'INR', receipt: receipt.slice(0, 40), notes });
  return response.data;
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string) => {
  const { keySecret } = getConfig();
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(signature || '', 'utf8');
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
};

export const verifyWebhookSignature = (rawBody: Buffer, signature: string) => {
  const { webhookSecret } = getConfig();
  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
};
