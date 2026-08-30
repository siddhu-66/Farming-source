import request from 'supertest';
import app from '../app';

describe('Health Checks API', () => {
  it('GET /api/v1/health should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/health/weather should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health/weather');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/health/ai should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health/ai');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
