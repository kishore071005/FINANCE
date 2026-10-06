const {
  toMinorUnits,
  toMajorUnits,
  totalRevenuePaid,
  isPastDue
} = require('../../backend/src/modules/revenue/revenue.service');

describe('Revenue monetary precision (integer minor units)', () => {
  it('converts major units to cents without float error', () => {
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits('19.99')).toBe(1999);
    expect(toMinorUnits(10000)).toBe(1000000);
    expect(toMinorUnits(0)).toBe(0);
  });

  it('handles the classic 0.1 + 0.2 float case via string parsing', () => {
    expect(toMinorUnits('0.10') + toMinorUnits('0.20')).toBe(30);
    expect(toMajorUnits(30)).toBe(0.3);
  });

  it('round-trips major/minor units', () => {
    expect(toMajorUnits(toMinorUnits('100.50'))).toBe(100.5);
  });
});

describe('Revenue totals', () => {
  it('sums only Paid invoices in integer cents', () => {
    const invoices = [
      { paymentStatus: 'Paid', amountCents: 10000 },
      { paymentStatus: 'Paid', amountCents: 2500 },
      { paymentStatus: 'Pending', amountCents: 99999 },
      { paymentStatus: 'Overdue', amountCents: 5000 }
    ];
    expect(totalRevenuePaid(invoices)).toBe(12500);
  });

  it('returns 0 for empty input (empty state, no crash)', () => {
    expect(totalRevenuePaid([])).toBe(0);
    expect(totalRevenuePaid(null)).toBe(0);
  });
});

describe('Overdue display hint (no auto-transition)', () => {
  it('flags past-due unpaid invoices as a hint only', () => {
    expect(
      isPastDue({ dueDate: '2000-01-01', paymentDate: null, paymentStatus: 'Pending' })
    ).toBe(true);
  });

  it('does not flag paid or future-due invoices', () => {
    expect(
      isPastDue({ dueDate: '2000-01-01', paymentDate: '2000-01-02', paymentStatus: 'Paid' })
    ).toBe(false);
    expect(
      isPastDue({ dueDate: '2999-01-01', paymentDate: null, paymentStatus: 'Pending' })
    ).toBe(false);
  });
});
