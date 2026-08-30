import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-1234567890123456';

const createBuyerToken = () => {
  return jwt.sign(
    { userId: 'user-buyer-101', role: 'BUYER', email: 'buyer@example.com', name: 'AgriCorp' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table: string) => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'order-999',
              buyer_id: 'buyer-101',
              listing_id: 'listing-123',
              quantity: 50,
              total_price: 125000,
              status: 'pending'
            },
            error: null
          })
        })),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          if (table === 'listings') {
            return Promise.resolve({
              data: {
                id: 'listing-123',
                seller_id: 'user-farmer-1',
                farmer_id: 'farmer-1',
                crop_name: 'Organic Wheat',
                quantity: 100,
                price: 2500,
                price_per_unit: 2500,
                unit: 'quintal',
                status: 'active'
              },
              error: null
            });
          }
          if (table === 'buyers') {
            return Promise.resolve({
              data: { id: 'buyer-101', user_id: 'user-buyer-101' },
              error: null
            });
          }
          return Promise.resolve({ data: { id: 'mock-id' }, error: null });
        }),
        then: jest.fn().mockImplementation((resolve) => resolve({
          data: [
            {
              id: 'listing-123',
              crop_name: 'Organic Wheat',
              price: 2500,
              quantity: 100,
              status: 'active'
            }
          ],
          count: 1,
          error: null
        }))
      };
      return mockQueryBuilder;
    })
  }
}));

describe('Marketplace & Orders API Tests', () => {
  let buyerToken: string;

  beforeAll(() => {
    buyerToken = createBuyerToken();
  });

  it('MKT-001: Should successfully query marketplace listings with filters', async () => {
    const res = await request(app)
      .get('/api/v1/marketplace?category=Grains&state=Punjab&minPrice=1000')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.listings).toBeDefined();
    expect(Array.isArray(res.body.data.listings)).toBe(true);
  });

  it('MKT-002: Should successfully place an order for a marketplace listing', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        listingId: 'listing-123',
        quantity: 50
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
  });

  it('MKT-003: Should reject order creation with invalid quantity (validation 422/400)', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        listingId: 'listing-123',
        quantity: 0
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});
