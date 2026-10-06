// Domain create/read/update flow over HTTP.
// Mongoose model mocked in-memory. Validation, service, controller,
// routes under test are all real.

jest.mock('../../backend/src/modules/domains/domain.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const matches = (doc, query = {}) => {
    if (query.registrar && !query.registrar.test(doc.registrar)) {
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
const DomainModel = require('../../backend/src/modules/domains/domain.model');

const validDomain = {
  domainName: 'example.com',
  registrar: 'Namecheap',
  renewalDate: '2026-12-01',
  renewalCost: 12.99,
  hostingProvider: 'Vercel',
  hostingCost: 20
};

describe('Domains API create/read/update flow', () => {
  beforeEach(() => {
    DomainModel.__reset();
    jest.clearAllMocks();
  });

  it('creates a domain with required fields → 201', async () => {
    const res = await request(app).post('/api/domains').send(validDomain);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      domainName: 'example.com',
      registrar: 'Namecheap',
      hostingProvider: 'Vercel'
    });
    expect(res.body.data.renewalCostCents).toBe(1299);
    expect(res.body.data.hostingCostCents).toBe(2000);
  });

  it('lists records and returns summary with totals → 200', async () => {
    await request(app).post('/api/domains').send(validDomain);
    const list = await request(app).get('/api/domains');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    const summary = await request(app).get('/api/domains/summary');
    expect(summary.status).toBe(200);
    expect(summary.body.data.totalRenewalCostCents).toBe(1299);
    expect(summary.body.data.totalHostingCostCents).toBe(2000);
    expect(summary.body.data.count).toBe(1);
  });

  it('reads by id and updates hosting cost → 200', async () => {
    const created = await request(app).post('/api/domains').send(validDomain);
    const got = await request(app).get(`/api/domains/${created.body.data.id}`);
    expect(got.status).toBe(200);
    const updated = await request(app)
      .patch(`/api/domains/${created.body.data.id}`)
      .send({ hostingCost: 25 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.hostingCostCents).toBe(2500);
  });

  it('rejects missing name, invalid costs → 400 without leaking', async () => {
    const missing = await request(app)
      .post('/api/domains')
      .send({ registrar: 'x' });
    expect(missing.status).toBe(400);
    expect(missing.body.errors).toContain('Domain name is required');

    const bad = await request(app)
      .post('/api/domains')
      .send({ ...validDomain, renewalCost: 'invalid' });
    expect(bad.status).toBe(400);
    expect(JSON.stringify(bad.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('returns 404 for unknown domain id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/domains/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
