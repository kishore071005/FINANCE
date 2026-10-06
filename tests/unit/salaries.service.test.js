const {
  toMinorUnits,
  toMajorUnits,
  computeNet,
  totalMonthlyCost,
  totalsByDepartment,
  totalsByEmployee
} = require('../../backend/src/modules/salaries/salary.service');

describe('Salary monetary precision (integer minor units)', () => {
  it('converts major units to cents without float error', () => {
    expect(toMinorUnits(50000)).toBe(5000000);
    expect(toMinorUnits('5000.50')).toBe(500050);
    expect(toMinorUnits(0)).toBe(0);
  });

  it('computes net as gross minus deductions in integer cents', () => {
    expect(computeNet(5000000, 0)).toBe(5000000);
    expect(computeNet(5000000, 50000)).toBe(4950000);
    expect(toMajorUnits(computeNet(500000, 50000))).toBe(4500);
  });
});

describe('Salary summary (Test Case 7)', () => {
  // A=50000, B=40000, C=60000 → Total 150000
  const records = [
    { employee: 'Employee A', department: 'Engineering', netCents: 5000000 },
    { employee: 'Employee B', department: 'Engineering', netCents: 4000000 },
    { employee: 'Employee C', department: 'Marketing', netCents: 6000000 }
  ];

  it('computes total monthly salary cost = 150000', () => {
    expect(totalMonthlyCost(records)).toBe(15000000);
    expect(toMajorUnits(totalMonthlyCost(records))).toBe(150000);
  });
});

describe('Department salary summary (Test Case 8)', () => {
  // Engineering: A=50000 + B=60000 = 110000; Marketing: C=40000; Total 150000
  const records = [
    { employee: 'Employee A', department: 'Engineering', netCents: 5000000 },
    { employee: 'Employee B', department: 'Engineering', netCents: 6000000 },
    { employee: 'Employee C', department: 'Marketing', netCents: 4000000 }
  ];

  it('computes department totals', () => {
    expect(totalsByDepartment(records)).toEqual({
      Engineering: 11000000,
      Marketing: 4000000
    });
  });

  it('computes employee totals', () => {
    expect(totalsByEmployee(records)).toEqual({
      'Employee A': 5000000,
      'Employee B': 6000000,
      'Employee C': 4000000
    });
  });

  it('returns empty totals for empty input (empty state, no crash)', () => {
    expect(totalMonthlyCost([])).toBe(0);
    expect(totalMonthlyCost(null)).toBe(0);
    expect(totalsByDepartment([])).toEqual({});
    expect(totalsByEmployee(null)).toEqual({});
  });
});
