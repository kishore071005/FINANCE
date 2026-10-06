const {
  ALLOWED_STATUSES,
  isValidStatus,
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/revenue/revenue.validation');

describe('Revenue status validation (Test Case 4)', () => {
  it.each([['Pending'], ['Partially Paid'], ['Paid'], ['Overdue']])(
    'accepts status %s',
    (status) => {
      expect(isValidStatus(status)).toBe(true);
    }
  );

  it('rejects invalid statuses', () => {
    expect(isValidStatus('Unpaid')).toBe(false);
    expect(isValidStatus('pending')).toBe(false);
    expect(isValidStatus('')).toBe(false);
    expect(isValidStatus(null)).toBe(false);
  });

  it('exposes exactly the four allowed statuses', () => {
    expect([...ALLOWED_STATUSES].sort()).toEqual(
      ['Overdue', 'Paid', 'Partially Paid', 'Pending'].sort()
    );
  });
});

describe('Revenue amount validation (Test Case 10)', () => {
  it('accepts valid non-negative amounts', () => {
    expect(isValidAmount(10000)).toBe(true);
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount('100.50')).toBe(true);
  });

  it('rejects invalid / non-numeric values', () => {
    expect(isValidAmount('invalid')).toBe(false);
    expect(isValidAmount('abc123')).toBe(false);
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount(undefined)).toBe(false);
  });

  it('rejects negative values', () => {
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount('-5.00')).toBe(false);
  });
});

describe('Revenue required fields (Test Case 11)', () => {
  const validBody = {
    customer: 'Acme Corp',
    invoiceNumber: 'INV-001',
    invoiceDate: '2026-01-15',
    amount: 10000
  };

  it('accepts a complete invoice', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('rejects missing customer', () => {
    const errors = validateCreate({ ...validBody, customer: undefined });
    expect(errors).toContain('Customer is required');
  });

  it('rejects missing invoice number and invoice date', () => {
    const errors = validateCreate({ customer: 'Acme', amount: 100 });
    expect(errors).toContain('Invoice Number is required');
    expect(errors).toContain('Invoice Date is required');
  });

  it('rejects invalid status on update', () => {
    const errors = validateUpdate({ paymentStatus: 'Almost Paid' });
    expect(errors).toContain(
      'Payment Status must be one of: Pending, Partially Paid, Paid, Overdue'
    );
  });
});
