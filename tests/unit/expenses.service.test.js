const {
  toMinorUnits,
  toMajorUnits,
  totalsByCategory,
  totalsByDepartment,
  totalAmount
} = require('../../backend/src/modules/expenses/expense.service');

describe('Expense monetary precision (integer minor units)', () => {
  it('converts major units to cents without float error', () => {
    expect(toMinorUnits(99.99)).toBe(9999);
    expect(toMinorUnits('99.99')).toBe(9999);
    expect(toMinorUnits(0)).toBe(0);
  });

  it('round-trips major/minor units', () => {
    expect(toMajorUnits(toMinorUnits('150.75'))).toBe(150.75);
  });
});

describe('Expense category summary (Test Case 9)', () => {
  // SaaS=10000, Marketing=15000, Salaries=50000, Operations=5000, Total=80000
  const expenses = [
    { category: 'SaaS', amountCents: 1000000, department: 'Engineering' },
    { category: 'Marketing', amountCents: 1500000, department: 'Growth' },
    { category: 'Salaries', amountCents: 5000000, department: 'Engineering' },
    { category: 'Operations', amountCents: 500000, department: 'Operations' }
  ];

  it('computes per-category totals in integer cents', () => {
    expect(totalsByCategory(expenses)).toEqual({
      SaaS: 1000000,
      Marketing: 1500000,
      Salaries: 5000000,
      Operations: 500000
    });
  });

  it('computes the grand total (80000 major units)', () => {
    expect(totalAmount(expenses)).toBe(8000000);
    expect(toMajorUnits(totalAmount(expenses))).toBe(80000);
  });

  it('computes per-department totals', () => {
    expect(totalsByDepartment(expenses)).toEqual({
      Engineering: 6000000,
      Growth: 1500000,
      Operations: 500000
    });
  });

  it('returns empty totals for empty input (empty state, no crash)', () => {
    expect(totalsByCategory([])).toEqual({});
    expect(totalsByDepartment(null)).toEqual({});
    expect(totalAmount([])).toBe(0);
    expect(totalAmount(null)).toBe(0);
  });
});
