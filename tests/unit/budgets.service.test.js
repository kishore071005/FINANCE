const {
  toMinorUnits,
  toMajorUnits,
  computeActual,
  computeRemaining,
  isOverrun
} = require('../../backend/src/modules/budgets/budget.service');

describe('Budget remaining (Test Case 5)', () => {
  it('Budget 100000 − Actual 75000 = Remaining 25000', () => {
    expect(computeRemaining(10000000, 7500000)).toBe(2500000);
    expect(toMajorUnits(computeRemaining(10000000, 7500000))).toBe(25000);
    expect(isOverrun(2500000)).toBe(false);
  });
});

describe('Budget overrun (Test Case 6)', () => {
  it('Budget 100000 − Actual 120000 = Remaining −20000 with overrun flag', () => {
    expect(computeRemaining(10000000, 12000000)).toBe(-2000000);
    expect(toMajorUnits(computeRemaining(10000000, 12000000))).toBe(-20000);
    expect(isOverrun(-2000000)).toBe(true);
  });

  it('zero remaining is not an overrun (no invented threshold)', () => {
    expect(isOverrun(0)).toBe(false);
  });

  it('small positive remaining is not flagged (no approaching threshold)', () => {
    expect(isOverrun(1)).toBe(false);
  });
});

describe('Actual spending derivation from expenses + salaries', () => {
  const expenses = [
    { department: 'Technology', amountCents: 500000 },
    { department: 'technology', amountCents: 100000 },
    { department: 'Marketing', amountCents: 99999 }
  ];
  const salaries = [
    { department: 'Technology', netCents: 200000 },
    { department: 'HR', netCents: 11111 }
  ];

  it('sums matching expenses and salaries case-insensitively', () => {
    expect(computeActual(expenses, salaries, 'Technology')).toEqual({
      expenseCents: 600000,
      salaryCents: 200000,
      actualCents: 800000
    });
  });

  it('returns zeros when nothing matches', () => {
    expect(computeActual(expenses, salaries, 'Sales')).toEqual({
      expenseCents: 0,
      salaryCents: 0,
      actualCents: 0
    });
  });

  it('handles empty inputs without crashing', () => {
    expect(computeActual([], [], 'HR')).toEqual({
      expenseCents: 0,
      salaryCents: 0,
      actualCents: 0
    });
    expect(computeActual(null, null, 'HR')).toEqual({
      expenseCents: 0,
      salaryCents: 0,
      actualCents: 0
    });
  });
});

describe('Budget monetary precision', () => {
  it('converts to cents without float error', () => {
    expect(toMinorUnits(100000)).toBe(10000000);
    expect(toMinorUnits('75000.50')).toBe(7500050);
  });
});
