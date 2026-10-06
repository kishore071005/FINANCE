// Subscription create/read/update flow over HTTP.
// Mongoose model mocked in-memory. Validation, service, controller,
// routes under test are all real.

jest.mock('../../backend/src/modules/subscriptions/subscription.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const matches = (doc, query = {}) => {
    if (query.status && doc.status !== query.status) {
      return false;
    }
    if (query.billingCycle && doc.billingCycle !== query.billingCycle) {
      return false;
    }
    return true;
  };

  return {
    create: jest.fn(async (data) => {
      const doc = {
        ...data,
        _id: newId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.push(doc);
      return { toObject: () => ({ ...doc }) };
    }),
    find: jest.fn((query) => {
      const filtered = store.filter((d) => matches(d, query));
      const sorted = [...filtered].sort(
        (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
      );
      return { sort: () => ({ lean: async () => sorted.map((d) => ({ ...d })) }) };
    }),
    findById: jest.fn((id) => ({
      lean: async () => {
        const found = store.find((d) => String(d._id) === String(id));
        return found ? { ...found } : null;
      }
    })),
    findByIdAndUpdate: jest.fn((id, update) => ({
      lean: async () => {
        const index = store.findIndex((d) => String(d._id) === String(id));
        if (index === -1) {
          return null;
        }
        store[index] = { ...store[index], ...update };
        return { ...store[index] };
      }
    })),
    __reset: () => {
      store = [];
    }
  };
});

const request = require('supertest');
const app = require('../../backend/src/app');
const SubscriptionModel = require('../../backend/src/modules/subscriptions/subscription.model');

const validSub = {
  serviceName: 'GitHub',
  cost: 120,
  billingCycle: 'Annual',
  renewalDate: '2026-12-01'
};

describe('Subscriptions API create/read/update flow', () => {
  beforeEach(() => {
    SubscriptionModel.__reset();
    jest.clearAllMocks();
  });

  it('creates an annual subscription → 201 with normalized monthly cost', async () => {
    const res = await request(app).post('/api/subscriptions').send(validSub);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.costCents).toBe(12000);
    expect(res.body.data.normalizedMonthlyCents).toBe(1000);
    expect(res.body.data.monthlyCost).toBe(10);
    expect(res.body.data.status).toBe('Active');
  });

  it('lists subscriptions and returns summary with upcoming renewals → 200', async () => {
    await request(app).post('/api/subscriptions').send(validSub);
    await request(app)
      .post('/api/subscriptions')
      .send({ serviceName: 'Figma', cost: 15, billingCycle: 'Monthly', renewalDate: '2026-11-01' });
    const list = await request(app).get('/api/subscriptions');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    const summary = await request(app).get('/api/subscriptions/summary');
    expect(summary.status).toBe(200);
    expect(summary.body.data.totalMonthlyCents).toBe(1000 + 1500);
    expect(summary.body.data.activeCount).toBe(2);
  });

  it('reads by id and updates cycle with recomputed normalization → 200', async () => {
    const created = await request(app).post('/api/subscriptions').send(validSub);
    const got = await request(app).get(`/api/subscriptions/${created.body.data.id}`);
    expect(got.status).toBe(200);
    const updated = await request(app)
      .patch(`/api/subscriptions/${created.body.data.id}`)
      .send({ billingCycle: 'Monthly', cost: 12 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.normalizedMonthlyCents).toBe(1200);
  });

  it('rejects invalid cycle, cost, and missing fields → 400 without leaking', async () => {
    const badCycle = await request(app)
      .post('/api/subscriptions')
      .send({ ...validSub, billingCycle: 'Weekly' });
    expect(badCycle.status).toBe(400);

    const badCost = await request(app)
      .post('/api/subscriptions')
      .send({ ...validSub, cost: 'invalid' });
    expect(badCost.status).toBe(400);

    const missing = await request(app)
      .post('/api/subscriptions')
      .send({ serviceName: 'x' });
    expect(missing.status).toBe(400);
    expect(JSON.stringify(missing.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('returns 404 for unknown subscription id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/subscriptions/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
