// Expense create/read/update flow over HTTP.
// Mongoose model mocked in-memory (no live MongoDB dependency for CI).
// Validation, service, controller, routes under test are all real.

jest.mock('../../backend/src/modules/expenses/expense.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const matches = (doc, query = {}) => {
    if (query.category && doc.category !== query.category) {
      return false;
    }
    if (query.department && !query.department.test(doc.department)) {
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
const ExpenseModel = require('../../backend/src/modules/expenses/expense.model');

const validExpense = {
  category: 'SaaS',
  description: 'Monthly subscription',
  amount: 99.99,
  date: '2026-02-01',
  vendor: 'Acme SaaS',
  department: 'Engineering'
};

describe('Expenses API create/read/update flow', () => {
  beforeEach(() => {
    ExpenseModel.__reset();
    jest.clearAllMocks();
  });

  it('creates an expense with all required fields → 201', async () => {
    const res = await request(app).post('/api/expenses').send(validExpense);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      category: 'SaaS',
      department: 'Engineering',
      vendor: 'Acme SaaS'
    });
    expect(res.body.data.amountCents).toBe(9999);
  });

  it('lists created expenses → 200 with consistent response shape', async () => {
    await request(app).post('/api/expenses').send(validExpense);
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by category → 200', async () => {
    await request(app).post('/api/expenses').send(validExpense);
    await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, category: 'Travel', description: 'Flight' });
    const res = await request(app).get('/api/expenses?category=Travel');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe('Travel');
  });

  it('returns summary totals → 200', async () => {
    await request(app).post('/api/expenses').send(validExpense);
    await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, category: 'Travel', description: 'Flight', amount: 50 });
    const res = await request(app).get('/api/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCents).toBe(9999 + 5000);
    expect(res.body.data.byCategoryCents).toMatchObject({ SaaS: 9999, Travel: 5000 });
    expect(res.body.data.count).toBe(2);
  });

  it('reads a single expense by id → 200 and updates it → 200', async () => {
    const created = await request(app).post('/api/expenses').send(validExpense);
    const got = await request(app).get(`/api/expenses/${created.body.data.id}`);
    expect(got.status).toBe(200);
    const updated = await request(app)
      .patch(`/api/expenses/${created.body.data.id}`)
      .send({ department: 'Growth' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.department).toBe('Growth');
  });

  it('rejects invalid category and negative amount → 400 without leaking internals', async () => {
    const badCat = await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, category: 'Crypto' });
    expect(badCat.status).toBe(400);
    expect(JSON.stringify(badCat.body)).not.toMatch(/stack|mongodb|mongoose/i);

    const negative = await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, amount: -5 });
    expect(negative.status).toBe(400);
  });

  it('returns 404 for unknown expense id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/expenses/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
