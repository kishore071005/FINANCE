// Budget create/read flow over HTTP with DERIVED actuals.
// Budget model mocked in-memory; Expense and Salary models mocked with
// preset source data. Service, controller, routes under test are all real.

jest.mock('../../backend/src/modules/budgets/budget.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

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
      const filtered = store.filter((d) => {
        if (query.department && d.department !== query.department) {
          return false;
        }
        return true;
      });
      const sorted = [...filtered].sort((a, b) => a.department.localeCompare(b.department));
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

jest.mock('../../backend/src/modules/expenses/expense.model', () => ({
  find: jest.fn(() => ({
    lean: async () => [
      { department: 'Technology', amountCents: 5000000 },
      { department: 'Marketing', amountCents: 1500000 }
    ]
  }))
}));

jest.mock('../../backend/src/modules/salaries/salary.model', () => ({
  find: jest.fn(() => ({
    lean: async () => [
      { department: 'Technology', netCents: 2000000, employee: 'A' },
      { department: 'HR', netCents: 1000000, employee: 'B' }
    ]
  }))
}));

const request = require('supertest');
const app = require('../../backend/src/app');
const BudgetModel = require('../../backend/src/modules/budgets/budget.model');

describe('Budgets API create/read flow with derived actuals', () => {
  beforeEach(() => {
    BudgetModel.__reset();
    jest.clearAllMocks();
  });

  it('creates a budget → 201 with actual derived from expenses + salaries', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .send({ department: 'Technology', budget: 100000 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // expenses 50000 + salaries 20000 = 70000 actual
    expect(res.body.data.actualSpendingCents).toBe(7000000);
    expect(res.body.data.expenseSpendingCents).toBe(5000000);
    expect(res.body.data.salarySpendingCents).toBe(2000000);
    expect(res.body.data.remainingCents).toBe(3000000);
    expect(res.body.data.overrun).toBe(false);
  });

  it('flags overrun when actual exceeds budget → 200 with overrun true', async () => {
    const created = await request(app)
      .post('/api/budgets')
      .send({ department: 'Marketing', budget: 10000 });
    expect(created.body.data.actualSpendingCents).toBe(1500000);
    expect(created.body.data.remainingCents).toBe(-500000);
    expect(created.body.data.overrun).toBe(true);
  });

  it('lists budgets and returns summary → 200', async () => {
    await request(app).post('/api/budgets').send({ department: 'Technology', budget: 100000 });
    await request(app).post('/api/budgets').send({ department: 'HR', budget: 50000 });
    const list = await request(app).get('/api/budgets');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    const summary = await request(app).get('/api/budgets/summary');
    expect(summary.status).toBe(200);
    expect(summary.body.data.count).toBe(2);
    expect(summary.body.data.totalBudgetCents).toBe(15000000);
  });

  it('reads by id and updates budget → 200', async () => {
    const created = await request(app)
      .post('/api/budgets')
      .send({ department: 'HR', budget: 50000 });
    const got = await request(app).get(`/api/budgets/${created.body.data.id}`);
    expect(got.status).toBe(200);
    const updated = await request(app)
      .patch(`/api/budgets/${created.body.data.id}`)
      .send({ budget: 60000 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.budgetCents).toBe(6000000);
  });

  it('rejects invalid department and negative budget → 400 without leaking', async () => {
    const badDept = await request(app)
      .post('/api/budgets')
      .send({ department: 'Engineering', budget: 100 });
    expect(badDept.status).toBe(400);

    const negative = await request(app)
      .post('/api/budgets')
      .send({ department: 'HR', budget: -5 });
    expect(negative.status).toBe(400);
    expect(JSON.stringify(negative.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('returns 404 for unknown budget id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/budgets/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
