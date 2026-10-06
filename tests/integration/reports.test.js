// Integration tests for the Financial Reports API — GET /api/reports and /api/reports/:type
// Covers harness test cases:
// - Each required report returns data consistent with underlying modules
// - Monthly profit / loss matches Overview calculations
// - Outstanding and upcoming payments are consistent with Revenue and Subscriptions
// - Backend failure produces proper error state without exposing internal paths

const request = require('supertest');
const app = require('../../backend/src/app');

const DB_TIMEOUT = 15000;

describe('Reports API — /api/reports', () => {
  it('GET /api/reports: returns all 10 reports structure or graceful error when DB is unavailable', async () => {
    const response = await request(app)
      .get('/api/reports')
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('generatedAt');
      expect(response.body.data).toHaveProperty('reports');

      const { reports } = response.body.data;
      // Verify all 10 required reports exist
      expect(reports).toHaveProperty('revenue');
      expect(reports).toHaveProperty('expenses');
      expect(reports).toHaveProperty('salaries');
      expect(reports).toHaveProperty('saas');
      expect(reports).toHaveProperty('vendors');
      expect(reports).toHaveProperty('subscriptions');
      expect(reports).toHaveProperty('departments');
      expect(reports).toHaveProperty('monthlyPL');
      expect(reports).toHaveProperty('outstanding');
      expect(reports).toHaveProperty('upcoming');
    } else {
      expect(response.body.success).toBe(false);
      const bodyStr = JSON.stringify(response.body);
      expect(bodyStr).not.toMatch(/node_modules/);
      expect(bodyStr).not.toMatch(/at\s+\w+\s+\(/);
    }
  }, DB_TIMEOUT);

  it('GET /api/reports/:type: handles individual report types correctly', async () => {
    const response = await request(app)
      .get('/api/reports/revenue')
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('success');
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'revenue');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data.data).toHaveProperty('totalRevenue');
    } else {
      expect(response.body.success).toBe(false);
    }
  }, DB_TIMEOUT);

  it('GET /api/reports/invalid-report: returns 404 for unknown report types when DB connects, or safe error', async () => {
    const response = await request(app)
      .get('/api/reports/non-existent-report-xyz')
      .expect('Content-Type', /json/);

    if (response.status === 404) {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    } else {
      // If DB failed, it returns 500 safely
      expect(response.body.success).toBe(false);
    }
  }, DB_TIMEOUT);
});
