// Revenue create/read/update flow over HTTP.
// The Mongoose model is mocked with an in-memory store because no live
// MongoDB is available in this environment. Validation, service, controller,
// and routes under test are all real. A live-DB run is still required once
// MongoDB is provisioned.

jest.mock('../../backend/src/modules/revenue/revenue.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const matches = (doc, query = {}) => {
    if (query.paymentStatus && doc.paymentStatus !== query.paymentStatus) {
      return false;
    }
    if (query.customer && !query.customer.test(doc.customer)) {
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
      return { sort: () => ({ lean: async () => filtered.map((d) => ({ ...d })) }) };
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
const RevenueModel = require('../../backend/src/modules/revenue/revenue.model');

const validInvoice = {
  customer: 'Acme Corp',
  invoiceNumber: 'INV-001',
  invoiceDate: '2026-01-15',
  amount: 100.5,
  paymentStatus: 'Pending'
};

describe('Revenue API create/read/update flow', () => {
  beforeEach(() => {
    RevenueModel.__reset();
    jest.clearAllMocks();
  });

  it('creates an invoice with all required fields → 201', async () => {
    const res = await request(app).post('/api/revenue').send(validInvoice);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      customer: 'Acme Corp',
      invoiceNumber: 'INV-001',
      paymentStatus: 'Pending'
    });
    expect(res.body.data.amountCents).toBe(10050);
  });

  it('lists created invoices → 200 with consistent response shape', async () => {
    await request(app).post('/api/revenue').send(validInvoice);
    const res = await request(app).get('/api/revenue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('reads a single invoice by id → 200', async () => {
    const created = await request(app).post('/api/revenue').send(validInvoice);
    const res = await request(app).get(`/api/revenue/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.invoiceNumber).toBe('INV-001');
  });

  it('updates payment status → 200', async () => {
    const created = await request(app).post('/api/revenue').send(validInvoice);
    const res = await request(app)
      .patch(`/api/revenue/${created.body.data.id}`)
      .send({ paymentStatus: 'Paid', paymentDate: '2026-01-20' });
    expect(res.status).toBe(200);
    expect(res.body.data.paymentStatus).toBe('Paid');
  });

  it('rejects invalid status → 400 without leaking internals', async () => {
    const res = await request(app)
      .post('/api/revenue')
      .send({ ...validInvoice, paymentStatus: 'Almost Paid' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('rejects missing customer and negative amount → 400', async () => {
    const missing = await request(app)
      .post('/api/revenue')
      .send({ invoiceNumber: 'INV-002', invoiceDate: '2026-01-15', amount: 50 });
    expect(missing.status).toBe(400);

    const negative = await request(app)
      .post('/api/revenue')
      .send({ ...validInvoice, invoiceNumber: 'INV-003', amount: -5 });
    expect(negative.status).toBe(400);
  });

  it('returns 404 for unknown invoice id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/revenue/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
