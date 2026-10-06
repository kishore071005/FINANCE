const {
  toMinorUnits,
  toMajorUnits,
  totalPaid,
  totalPending
} = require('../../backend/src/modules/vendors/vendor.service');

describe('Vendor derived totals (single source of truth)', () => {
  const payments = [
    { status: 'Paid', amountCents: 25000 },
    { status: 'Paid', amountCents: 10000 },
    { status: 'Pending', amountCents: 5000 }
  ];

  it('derives total paid from payment data', () => {
    expect(totalPaid(payments)).toBe(35000);
    expect(toMajorUnits(totalPaid(payments))).toBe(350);
  });

  it('derives pending amount from payment data', () => {
    expect(totalPending(payments)).toBe(5000);
    expect(toMajorUnits(totalPending(payments))).toBe(50);
  });

  it('returns 0 for empty input (empty state, no crash)', () => {
    expect(totalPaid([])).toBe(0);
    expect(totalPaid(null)).toBe(0);
    expect(totalPending([])).toBe(0);
    expect(totalPending(null)).toBe(0);
  });

  it('ignores unknown payment statuses in both totals', () => {
    const mixed = [...payments, { status: 'Refunded', amountCents: 99999 }];
    expect(totalPaid(mixed)).toBe(35000);
    expect(totalPending(mixed)).toBe(5000);
  });
});

describe('Vendor monetary precision', () => {
  it('converts amounts to cents without float error', () => {
    expect(toMinorUnits(250.75)).toBe(25075);
    expect(toMajorUnits(25075)).toBe(250.75);
  });
});
