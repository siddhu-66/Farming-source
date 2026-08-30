import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-1234567890123456';

const createTestToken = (userId: string, role: string, email: string = 'test@example.com') => {
  return jwt.sign(
    { userId, role, email, name: 'Test User' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table: string) => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          if (table === 'farmers') return Promise.resolve({ data: { id: 'farmer-123', user_id: 'user-farmer' }, error: null });
          if (table === 'buyers') return Promise.resolve({ data: { id: 'buyer-123', user_id: 'user-buyer' }, error: null });
          if (table === 'users') return Promise.resolve({ data: { id: 'user-123', role: 'FARMER', email: 'test@example.com' }, error: null });
          return Promise.resolve({ data: { id: 'mock-id' }, error: null });
        }),
        then: jest.fn().mockImplementation((resolve) => {
          if (typeof resolve === 'function') {
            return Promise.resolve(resolve({ data: [], error: null }));
          }
          return Promise.resolve({ data: [], error: null });
        }),
        catch: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
      };
      return mockQueryBuilder;
    })
  }
}));

describe('Role-Based Access Control (RBAC) API Tests', () => {
  describe('Unauthenticated Requests (401)', () => {
    it('RBAC-001: Should reject unauthenticated GET /api/v1/farmer/profile with 401', async () => {
      const res = await request(app).get('/api/v1/farmer/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('RBAC-002: Should reject unauthenticated GET /api/v1/buyer/marketplace with 401', async () => {
      const res = await request(app).get('/api/v1/buyer/marketplace');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('RBAC-003: Should reject unauthenticated GET /api/v1/admin/users with 401', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-Restricted Endpoints (403 Forbidden on Role Mismatch)', () => {
    it('RBAC-004: Should forbid a BUYER from accessing /api/v1/farmer/profile with 403', async () => {
      const buyerToken = createTestToken('user-buyer-1', 'BUYER', 'buyer@example.com');
      const res = await request(app)
        .get('/api/v1/farmer/profile')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have permission');
    });

    it('RBAC-005: Should forbid a FARMER from accessing /api/v1/admin/users with 403', async () => {
      const farmerToken = createTestToken('user-farmer-1', 'FARMER', 'farmer@example.com');
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have permission');
    });

    it('RBAC-006: Should forbid a TRANSPORTER from accessing /api/v1/industry endpoints with 403', async () => {
      const transportToken = createTestToken('user-trans-1', 'TRANSPORTER', 'trans@example.com');
      const res = await request(app)
        .get('/api/v1/industry/raw-materials')
        .set('Authorization', `Bearer ${transportToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authorized Role Access (200 / valid handling)', () => {
    it('RBAC-007: Should allow a FARMER with uppercase role to access farmer routes', async () => {
      const farmerToken = createTestToken('user-farmer', 'FARMER', 'farmer@example.com');
      const res = await request(app)
        .get('/api/v1/farmer/profile')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });

    it('RBAC-008: Should allow an ADMIN to access admin endpoints', async () => {
      const adminToken = createTestToken('user-admin-1', 'ADMIN', 'admin@agriassist.com');
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  });
});
