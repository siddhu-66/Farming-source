import express from 'express';
import otpRepo from '../repositories/otp_requests.repository';
import { authenticate, authorizeRole } from '../middleware';
import { supabase } from '../config/supabase';

const router = express.Router();

// Generate / Request OTP
router.post('/request-otp', async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;
    
    // Create the OTP Record
    const result = await otpRepo.createOtpRequest({
      phone: phone,
      purpose,
      request_ip: req.ip,
      request_device: req.headers['user-agent'],
    });

    // In a real application, we would call Twilio API here using result.rawOtp.
    // For now, we will simulate success and update the status to SENT.
    await otpRepo.updateOtpDeliveryStatus(result.record.id, 'SENT', 'SIMULATED_TWILIO_SID');

    res.status(200).json({
      success: true,
      message: 'OTP generated and sent successfully',
      data: {
        publicId: result.record.public_id,
        expiresAt: result.record.expires_at,
        // DEV ONLY: Exposing OTP for testing purposes. REMOVE IN PRODUCTION.
        _devOtp: process.env.NODE_ENV !== 'production' ? result.rawOtp : undefined
      }
    });
  } catch (err) {
    next(err);
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, purpose, otp } = req.body;
    const verifiedRecord = await otpRepo.verifyOtp(phone, purpose, otp);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        verifiedAt: verifiedRecord.verified_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;
    const result = await otpRepo.resendOtp(phone, purpose);

    // Simulate Twilio
    await otpRepo.updateOtpDeliveryStatus(result.record.id, 'SENT', 'SIMULATED_TWILIO_SID_RESEND');

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        publicId: result.record.public_id,
        expiresAt: result.record.expires_at,
        resendCount: result.record.resend_count,
        // DEV ONLY
        _devOtp: process.env.NODE_ENV !== 'production' ? result.rawOtp : undefined
      }
    });
  } catch (err) {
    next(err);
  }
});

// Check OTP Status (Admin or Internal)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('otp_requests')
      .select('public_id, phone, purpose, status, expires_at, verified_at, resend_count, verification_attempts')
      .eq('public_id', req.params.id)
      .maybeSingle();

    if (error || !data) {
      res.status(404).json({ success: false, message: 'OTP request not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Admin Search
router.get('/', authenticate, authorizeRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('otp_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
