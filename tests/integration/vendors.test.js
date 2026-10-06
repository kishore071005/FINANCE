// Vendor create/read/payment flow over HTTP.
// Mongoose model mocked in-memory. Validation, service, controller,
// routes under test are all real.

jest.mock('../../backend/src/modules/vendors/vendor.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const toPlain = (doc) => ({ ...doc, payments: [...(doc.payments || [])] });

  return {
    create: jest.fn(async (data) => {
      const doc = {
        ...data,
        payments: [],
        _id: newId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.push(doc);
      return { toObject: () => toPlain(doc) };
    }),
    find: jest.fn((query) => {
      const filtered = store.filter((d) => {
        if (query.name && !query.name.test(d.name)) {
          return false;
        }
        return true;
      });
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      return { sort: () => ({ lean: async () => sorted.map(toPlain) }) };
    }),
    findById: jest.fn((id) => ({
      lean: async () => {
        const found = store.find((d) => String(d._id) === String(id));
        return found ? toPlain(found) : null;
      }
    })),
    findByIdAndUpdate: jest.fn((id, update) => ({
      lean: async () => {
        const index = store.findIndex((d) => String(d._id) === String(id));
        if (index === -1) {
          return null;
        }
        if (update && update.$push && update.$push.payments) {
          const entry = {
            ...update.$push.payments,
            _id: newId()
          };
          store[index] = { ...store[index], payments: [...store[index].payments, entry] };
        } else {
          store[index] = { ...store[index], ...update };
        }
        return toPlain(store[index]);
      }
    })),
    __reset: () => {
      store = [];
    }
  };
});

const request = require('supertest');
const app = require('../../backend/src/app');
const VendorModel = require('../../backend/src/modules/vendors/vendor.model');

const validVendor = {
  name: 'Acme Supplies',
  contact: 'billing@acme.com',
  paymentTerms: 'Net 30'
};

describe('Vendors API create/read/payment flow', () => {
  beforeEach(() => {
    VendorModel.__reset();
    jest.clearAllMocks();
  });

  it('creates a vendor with required fields → 201 with zero totals', async () => {
    const res = await request(app).post('/api/vendors').send(validVendor);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: 'Acme Supplies' });
    expect(res.body.data.totalPaidCents).toBe(0);
    expect(res.body.data.pendingCents).toBe(0);
  });

  it('derives total paid and pending from recorded payments', async () => {
    const created = await request(app).post('/api/vendors').send(validVendor);
    const id = created.body.data.id;
    await request(app).post(`/api/vendors/${id}/payments`).send({ amount: 250, status: 'Paid' });
    await request(app).post(`/api/vendors/${id}/payments`).send({ amount: 100, status: 'Paid' });
    await request(app).post(`/api/vendors/${id}/payments`).send({ amount: 50, status: 'Pending' });

    const got = await request(app).get(`/api/vendors/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.data.totalPaidCents).toBe(35000);
    expect(got.body.data.totalPaid).toBe(350);
    expect(got.body.data.pendingCents).toBe(5000);
    expect(got.body.data.pendingAmount).toBe(50);
    expect(got.body.data.payments).toHaveLength(3);
  });

  it('lists vendors and payment history → 200', async () => {
    const created = await request(app).post('/api/vendors').send(validVendor);
    await request(app)
      .post(`/api/vendors/${created.body.data.id}/payments`)
      .send({ amount: 10, status: 'Pending' });
    const list = await request(app).get('/api/vendors');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].pendingCents).toBe(1000);
    const history = await request(app).get(`/api/vendors/${created.body.data.id}/payments`);
    expect(history.status).toBe(200);
    expect(history.body.data).toHaveLength(1);
  });

  it('rejects missing fields and bad payments → 400 without leaking', async () => {
    const missing = await request(app).post('/api/vendors').send({ name: 'x' });
    expect(missing.status).toBe(400);
    expect(missing.body.errors).toContain('Contact is required');

    const created = await request(app).post('/api/vendors').send(validVendor);
    const bad = await request(app)
      .post(`/api/vendors/${created.body.data.id}/payments`)
      .send({ amount: 'invalid', status: 'Paid' });
    expect(bad.status).toBe(400);
    expect(JSON.stringify(bad.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('returns 404 for unknown vendor id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/vendors/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
