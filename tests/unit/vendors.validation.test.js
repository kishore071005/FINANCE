const {
  ALLOWED_PAYMENT_STATUSES,
  isValidPaymentStatus,
  isValidAmount,
  validateCreate,
  validateUpdate,
  validatePayment
} = require('../../backend/src/modules/vendors/vendor.validation');

describe('Vendor required field validation', () => {
  const validBody = {
    name: 'Acme Supplies',
    contact: 'billing@acme.com',
    paymentTerms: 'Net 30'
  };

  it('creates a vendor with required fields → no errors', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('rejects missing name, contact, payment terms', () => {
    const errors = validateCreate({});
    expect(errors).toContain('Vendor name is required');
    expect(errors).toContain('Contact is required');
    expect(errors).toContain('Payment terms are required');
  });

  it('rejects blank fields on update', () => {
    expect(validateUpdate({ name: '  ' })).toContain('Vendor name is required');
    expect(validateUpdate({ contact: '' })).toContain('Contact is required');
  });
});

describe('Vendor payment validation', () => {
  it('accepts Paid and Pending statuses', () => {
    expect(ALLOWED_PAYMENT_STATUSES).toEqual(['Paid', 'Pending']);
    expect(isValidPaymentStatus('Paid')).toBe(true);
    expect(isValidPaymentStatus('Pending')).toBe(true);
  });

  it('accepts a valid payment', () => {
    expect(validatePayment({ amount: 250, status: 'Paid' })).toEqual([]);
  });

  it('rejects missing amount, invalid amount, bad status', () => {
    expect(validatePayment({ status: 'Paid' })).toContain('Payment amount is required');
    expect(validatePayment({ amount: 'invalid', status: 'Paid' })).toContain(
      'Payment amount must be a valid non-negative financial amount'
    );
    expect(validatePayment({ amount: -5, status: 'Paid' })).toContain(
      'Payment amount must be a valid non-negative financial amount'
    );
    expect(validatePayment({ amount: 10 })).toContain('Payment status is required');
    expect(validatePayment({ amount: 10, status: 'Refunded' })).toContain(
      'Payment status must be Paid or Pending'
    );
  });

  it('accepts zero payment amounts', () => {
    expect(validatePayment({ amount: 0, status: 'Pending' })).toEqual([]);
  });
});

describe('Vendor amount validation', () => {
  it('accepts zero and decimals, rejects negatives', () => {
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount('250.75')).toBe(true);
    expect(isValidAmount(-1)).toBe(false);
  });
});
