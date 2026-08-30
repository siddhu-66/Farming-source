import request from 'supertest';
import app from '../app';

jest.mock('../repositories/auth.repository', () => ({
  __esModule: true,
  default: {
    getUserByEmail: jest.fn(),
    getUserByPhone: jest.fn(),
    createUser: jest.fn(),
    createRoleProfile: jest.fn(),
    insertOtp: jest.fn(),
    updateUser: jest.fn(),
    logLogin: jest.fn(),
    createSession: jest.fn().mockResolvedValue({ id: 'session-123' }),
    linkRefreshTokenToSession: jest.fn()
  }
}));

jest.mock('../repositories/refresh_tokens.repository', () => ({
  __esModule: true,
  default: {
    issueToken: jest.fn().mockResolvedValue({
      record: { id: 'rt-123' },
      jwtId: 'jti-123',
      rawToken: 'raw-token'
    })
  }
}));

jest.mock('../repositories/trusted_devices.repository', () => ({
  __esModule: true,
  default: {
    findDeviceByFingerprint: jest.fn(),
    registerDevice: jest.fn().mockResolvedValue({ id: 'device-123' }),
    updateDeviceLogin: jest.fn()
  }
}));

jest.mock('../services/security.service', () => ({
  __esModule: true,
  default: {
    logFailedLogin: jest.fn(),
    logSuspiciousActivity: jest.fn(),
    evaluateLoginRisk: jest.fn().mockResolvedValue(0),
    logNewDeviceLogin: jest.fn()
  }
}));

jest.mock('../services/twilio_verify.service', () => ({
  twilioVerifyService: {
    startVerification: jest.fn().mockResolvedValue({
      sid: 'VA1234567890abcdef',
      status: 'pending',
      to: '+919876543210',
      channel: 'sms',
      valid: false
    }),
    checkVerification: jest.fn().mockImplementation((phone: string, code: string) => {
      if (code === '123456') {
        return Promise.resolve({
          sid: 'VA1234567890abcdef',
          status: 'approved',
          to: phone,
          valid: true
        });
      }
      return Promise.resolve({
        sid: 'VA1234567890abcdef',
        status: 'pending',
        to: phone,
        valid: false
      });
    })
  }
}));

import AuthRepository from '../repositories/auth.repository';

describe('OTP Verification & Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('OTP-001: Should successfully verify valid OTP code', async () => {
      (AuthRepository.getUserByPhone as jest.Mock).mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        email: 'farmer@example.com',
        role: 'FARMER',
        full_name: 'Ramesh Patel',
        is_mobile_verified: false,
        status: 'PENDING'
      });
      (AuthRepository.updateUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        email: 'farmer@example.com',
        role: 'FARMER',
        full_name: 'Ramesh Patel',
        is_mobile_verified: true,
        status: 'ACTIVE'
      });

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.isMobileVerified).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('OTP-002: Should reject invalid OTP code with 409', async () => {
      (AuthRepository.getUserByPhone as jest.Mock).mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        email: 'farmer@example.com',
        role: 'FARMER',
        full_name: 'Ramesh Patel',
        is_mobile_verified: false,
        status: 'PENDING'
      });

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '000000'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid verification code');
    });

    it('OTP-003: Should reject missing parameters with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/resend-otp', () => {
    it('OTP-004: Should successfully trigger resending OTP', async () => {
      (AuthRepository.getUserByPhone as jest.Mock).mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        email: 'farmer@example.com',
        role: 'FARMER'
      });

      const res = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({
          phone: '9876543210'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maskedPhone).toBe('+91 ******3210');
    });
  });
});
