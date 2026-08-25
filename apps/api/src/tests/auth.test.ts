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
    createSession: jest.fn(),
    linkRefreshTokenToSession: jest.fn()
  }
}));

jest.mock('../services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../services/sms', () => ({
  sendSMS: jest.fn().mockResolvedValue(true)
}));

jest.mock('../repositories/login_history.repository', () => ({
  __esModule: true,
  default: {
    recordLoginAttempt: jest.fn()
  }
}));

jest.mock('../repositories/trusted_devices.repository', () => ({
  __esModule: true,
  default: {
    findDeviceByFingerprint: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
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

// Removed

import AuthRepository from '../repositories/auth.repository';

// Removed token service mock

describe('Authentication API (Section 14)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration Flow', () => {
    it('REG-001: Should successfully register a new user', async () => {
      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (AuthRepository.getUserByPhone as jest.Mock).mockResolvedValue(null);
      (AuthRepository.createUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'FARMER'
      });
      (AuthRepository.createRoleProfile as jest.Mock).mockResolvedValue(undefined);
      (AuthRepository.insertOtp as jest.Mock).mockResolvedValue(undefined);
      (AuthRepository.createSession as jest.Mock).mockResolvedValue({ id: 'session-123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          role: 'FARMER',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'Password@123'
        });

      console.log('REG-001 res:', res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Registration successful');
    });

    it('REG-007: Should return 422 Validation Error for empty request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(res.status).toBe(422); 
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid input data');
    });
  });

  describe('Login Flow', () => {
    it('LOGIN-002: Should return 401 for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      (AuthRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password: 'hashed_password',
        status: 'active'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
          role: 'FARMER'
        });

      console.log('LOGIN-002 res:', res.body);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
