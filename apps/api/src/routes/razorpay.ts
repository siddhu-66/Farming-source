import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { createOrder as createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from '../services/razorpay.service';

const router = Router();
const checkoutSchema = z.object({ orderId: z.string().uuid() });
const verifySchema = z.object({ orderId: z.string().uuid(), razorpayOrderId: z.string().min(1), razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) });

const canAccessOrder = (order: any, userId: string) => [order.farmer_id, order.buyer_id, order.industry_id].filter(Boolean).includes(userId);

// POST /api/v1/payments/razorpay/order
router.post('/order', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = checkoutSchema.parse(req.body);
    const { data: order, error } = await supabase.from('orders').select('id, farmer_id, buyer_id, industry_id, total_amount, paid_amount, status').eq('id', orderId).single();
    if (error || !order) throw createApiError(404, 'Order not found');
    if (!canAccessOrder(order, req.user!.id)) throw createApiError(403, 'You are not allowed to pay this order');

    const remaining = Number(order.total_amount || 0) - Number(order.paid_amount || 0);
    if (!Number.isFinite(remaining) || remaining <= 0) throw createApiError(400, 'Order has no outstanding balance');

    const razorpayOrder = await createRazorpayOrder(remaining, `order_${order.id}`, { orderId: order.id });
    const { data: record, error: insertError } = await supabase.from('razorpay_payments').insert({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount_paise: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      status: 'created',
      metadata: { userId: req.user!.id },
    }).select('id, order_id, razorpay_order_id, amount_paise, currency, status').single();
    if (insertError) throw insertError;

    res.status(201).json({ success: true, data: { payment: record, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (err) { if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message)); else next(err); }
});

// POST /api/v1/payments/razorpay/verify
router.post('/verify', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = verifySchema.parse(req.body);
    const { data: order, error: orderError } = await supabase.from('orders').select('id, farmer_id, buyer_id, industry_id, total_amount, paid_amount').eq('id', data.orderId).single();
    if (orderError || !order) throw createApiError(404, 'Order not found');
    if (!canAccessOrder(order, req.user!.id)) throw createApiError(403, 'You are not allowed to verify this payment');

    if (!verifyPaymentSignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature)) throw createApiError(400, 'Invalid payment signature');

    const { data: record, error: recordError } = await supabase.from('razorpay_payments').select('*').eq('razorpay_order_id', data.razorpayOrderId).eq('order_id', data.orderId).single();
    if (recordError || !record) throw createApiError(400, 'Razorpay order is not associated with this application order');
    if (record.amount_paise !== Math.round((Number(order.total_amount) - Number(order.paid_amount || 0)) * 100)) throw createApiError(409, 'Payment amount does not match the outstanding order balance');

    const { error: paymentError } = await supabase.from('razorpay_payments').update({ razorpay_payment_id: data.razorpayPaymentId, signature_verified: true, status: 'captured' }).eq('id', record.id);
    if (paymentError) throw paymentError;

    const paidAmount = Number(order.paid_amount || 0) + Number(record.amount_paise) / 100;
    const { error: orderUpdateError } = await supabase.from('orders').update({ paid_amount: paidAmount, payment_status: paidAmount >= Number(order.total_amount) ? 'completed' : 'partial', status: paidAmount >= Number(order.total_amount) ? 'payment_done' : undefined }).eq('id', order.id);
    if (orderUpdateError) throw orderUpdateError;

    res.json({ success: true, message: 'Payment verified successfully', data: { paymentId: data.razorpayPaymentId, orderId: order.id } });
  } catch (err) { if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message)); else next(err); }
});

// POST /api/v1/payments/razorpay/webhook
router.post('/webhook', async (req: any, res: Response, next: NextFunction) => {
  try {
    const rawBody: Buffer | undefined = req.rawBody;
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    if (!rawBody || !verifyWebhookSignature(rawBody, signature || '')) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

    const event = req.body;
    if (event?.event !== 'payment.captured' && event?.event !== 'payment.failed') return res.status(200).json({ success: true });

    const payment = event?.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;
    if (!razorpayOrderId || !razorpayPaymentId) return res.status(200).json({ success: true });

    const { data: record } = await supabase.from('razorpay_payments').select('*').eq('razorpay_order_id', razorpayOrderId).maybeSingle();
    if (!record) return res.status(200).json({ success: true });

    const status = event.event === 'payment.captured' ? 'captured' : 'failed';
    const { data: updated, error: updateError } = await supabase.from('razorpay_payments').update({ razorpay_payment_id: razorpayPaymentId, status, webhook_verified: true }).eq('id', record.id).select('*').single();
    if (updateError) throw updateError;

    // Only the first captured webhook settles the application order.
    if (status === 'captured' && record.status !== 'captured') {
      const { data: order } = await supabase.from('orders').select('id, total_amount, paid_amount').eq('id', record.order_id).single();
      if (order) {
        const paidAmount = Number(order.paid_amount || 0) + Number(record.amount_paise) / 100;
        await supabase.from('orders').update({ paid_amount: paidAmount, payment_status: paidAmount >= Number(order.total_amount) ? 'completed' : 'partial', status: paidAmount >= Number(order.total_amount) ? 'payment_done' : undefined }).eq('id', order.id);
      }
    }

    res.status(200).json({ success: true, data: { payment: updated?.id } });
  } catch (err) { next(err); }
});

export default router;
