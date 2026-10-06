// Salary create/read/update flow over HTTP.
// Mongoose model mocked in-memory. Validation, service, controller,
// routes under test are all real.

jest.mock('../../backend/src/modules/salaries/salary.model', () => {
  const crypto = require('crypto');
  const newId = () => crypto.randomBytes(12).toString('hex');
  let store = [];

  const matches = (doc, query = {}) => {
    if (query.department && !query.department.test(doc.department)) {
      return false;
    }
    if (query.employee && !query.employee.test(doc.employee)) {
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
const SalaryModel = require('../../backend/src/modules/salaries/salary.model');

const validSalary = {
  employee: 'Employee A',
  salary: 50000,
  department: 'Engineering'
};

describe('Salaries API create/read/update flow', () => {
  beforeEach(() => {
    SalaryModel.__reset();
    jest.clearAllMocks();
  });

  it('creates a salary record → 201 with computed monthly cost', async () => {
    const res = await request(app)
      .post('/api/salaries')
      .send({ ...validSalary, deductions: 5000 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      employee: 'Employee A',
      department: 'Engineering'
    });
    expect(res.body.data.grossCents).toBe(5000000);
    expect(res.body.data.deductionsCents).toBe(500000);
    expect(res.body.data.netCents).toBe(4500000);
    expect(res.body.data.monthlyCost).toBe(45000);
  });

  it('lists records and returns summary → 200', async () => {
    await request(app).post('/api/salaries').send(validSalary);
    await request(app)
      .post('/api/salaries')
      .send({ employee: 'Employee B', salary: 40000, department: 'Marketing' });
    const list = await request(app).get('/api/salaries');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    const summary = await request(app).get('/api/salaries/summary');
    expect(summary.status).toBe(200);
    expect(summary.body.data.totalMonthlyCostCents).toBe(9000000);
    expect(summary.body.data.byDepartmentCents).toMatchObject({
      Engineering: 5000000,
      Marketing: 4000000
    });
  });

  it('reads by id and updates deductions with recomputed net → 200', async () => {
    const created = await request(app).post('/api/salaries').send(validSalary);
    const got = await request(app).get(`/api/salaries/${created.body.data.id}`);
    expect(got.status).toBe(200);
    const updated = await request(app)
      .patch(`/api/salaries/${created.body.data.id}`)
      .send({ deductions: 10000 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.deductionsCents).toBe(1000000);
    expect(updated.body.data.netCents).toBe(4000000);
  });

  it('rejects missing fields, negative salary, over-deduction → 400', async () => {
    const missing = await request(app).post('/api/salaries').send({ salary: 100 });
    expect(missing.status).toBe(400);

    const negative = await request(app)
      .post('/api/salaries')
      .send({ ...validSalary, salary: -5 });
    expect(negative.status).toBe(400);

    const over = await request(app)
      .post('/api/salaries')
      .send({ ...validSalary, deductions: 99999999 });
    expect(over.status).toBe(400);
    expect(JSON.stringify(over.body)).not.toMatch(/stack|mongodb|mongoose/i);
  });

  it('returns 404 for unknown record id', async () => {
    const crypto = require('crypto');
    const res = await request(app).get(
      `/api/salaries/${crypto.randomBytes(12).toString('hex')}`
    );
    expect(res.status).toBe(404);
  });
});
