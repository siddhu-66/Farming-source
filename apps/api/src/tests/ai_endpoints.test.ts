import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-1234567890123456';

const createFarmerToken = () => {
  return jwt.sign(
    { userId: 'user-farmer-101', role: 'FARMER', email: 'farmer@example.com', name: 'Kisan' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table: string) => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockImplementation(() => {
          return {
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'msg-123',
                farmer_id: 'user-farmer-101',
                role: 'assistant',
                content: JSON.stringify({ text: 'Wheat is recommended for rabi season with proper irrigation.' })
              },
              error: null
            })
          };
        }),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          if (table === 'ai_conversations') {
            return Promise.resolve({ data: { id: 'conv-101', farmer_id: 'user-farmer-101', title: 'Crop Query' }, error: null });
          }
          if (table === 'farmers') {
            return Promise.resolve({ data: { id: 'farmer-101', state: 'Maharashtra', soil_type: 'Black Cotton' }, error: null });
          }
          return Promise.resolve({ data: { id: 'mock-single-id' }, error: null });
        }),
        then: jest.fn().mockImplementation((resolve) => resolve({ data: [], error: null }))
      };
      return mockQueryBuilder;
    })
  }
}));

jest.mock('../services/gemini.service', () => ({
  generateGroundedResponse: jest.fn().mockResolvedValue('Wheat and Mustard are optimal for your soil type and current climate.'),
  generateChatResponse: jest.fn().mockResolvedValue('Here are the recommended fertilizers for your crop: NPK 120:60:40 kg/ha.')
}));

jest.mock('../services/rag.service', () => ({
  searchKnowledge: jest.fn().mockResolvedValue([
    {
      ai_documents: { title: 'ICAR Wheat Advisory', source: 'ICAR', source_url: 'https://icar.org.in' },
      chunk_text: 'Wheat sowing in Maharashtra should be completed between Nov 1-15 for best yield.'
    }
  ]),
  ingestDocument: jest.fn().mockResolvedValue('doc-ingested-123')
}));

describe('Gemini AI & Agronomic Advisory API Tests', () => {
  let token: string;

  beforeAll(() => {
    token = createFarmerToken();
  });

  it('AI-001: Should successfully generate grounded AI chat advisory response', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'What is the best crop to grow this season in black soil?',
        language: 'en'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.message).toBeDefined();
    expect(res.body.data.sources).toHaveLength(1);
  });

  it('AI-002: Should perform crop disease detection scan', async () => {
    const res = await request(app)
      .post('/api/v1/ai/disease-detect')
      .set('Authorization', `Bearer ${token}`)
      .send({
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        cropName: 'Tomato'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.result).toBeDefined();
    expect(res.body.data.result.disease).toContain('Early Blight');
    expect(res.body.data.result.confidence).toBeGreaterThan(80);
    expect(res.body.data.result.treatment).toBeDefined();
  });

  it('AI-003: Should fetch AI analytics summary', async () => {
    const res = await request(app)
      .get('/api/v1/ai/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalConversations).toBeGreaterThan(0);
    expect(res.body.data.avgAccuracyScore).toBeDefined();
  });

  it('AI-004: Should translate agricultural text into regional Indian languages', async () => {
    const res = await request(app)
      .post('/api/v1/ai/translate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Hello, how can I help you?',
        targetLang: 'hi'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.translated).toContain('नमस्ते');
  });
});
