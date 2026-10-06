const {
  ALLOWED_CYCLES,
  ALLOWED_STATUSES,
  isValidCycle,
  isValidStatus,
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/subscriptions/subscription.validation');

describe('Subscription billing cycle validation', () => {
  it('accepts Monthly and Annual', () => {
    expect(ALLOWED_CYCLES).toEqual(['Monthly', 'Annual']);
    expect(isValidCycle('Monthly')).toBe(true);
    expect(isValidCycle('Annual')).toBe(true);
  });

  it('rejects other cycles', () => {
    expect(isValidCycle('Weekly')).toBe(false);
    expect(isValidCycle('monthly')).toBe(false);
    expect(isValidCycle('')).toBe(false);
  });
});

describe('Subscription status validation', () => {
  it('accepts Active and Inactive', () => {
    expect(ALLOWED_STATUSES).toEqual(['Active', 'Inactive']);
    expect(isValidStatus('Active')).toBe(true);
    expect(isValidStatus('Inactive')).toBe(true);
  });

  it('rejects other statuses', () => {
    expect(isValidStatus('Cancelled')).toBe(false);
    expect(isValidStatus('active')).toBe(false);
  });
});

describe('Subscription required fields', () => {
  const validBody = {
    serviceName: 'GitHub',
    cost: 120,
    billingCycle: 'Annual',
    renewalDate: '2026-12-01'
  };

  it('accepts a complete subscription', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('rejects missing service name, cost, cycle, renewal date', () => {
    const errors = validateCreate({});
    expect(errors).toContain('Service name is required');
    expect(errors).toContain('Cost is required');
    expect(errors).toContain('Billing cycle is required');
    expect(errors).toContain('Renewal date is required');
  });

  it('rejects invalid cost and status', () => {
    expect(validateCreate({ ...validBody, cost: 'invalid' })).toContain(
      'Cost must be a valid non-negative financial amount'
    );
    expect(validateCreate({ ...validBody, cost: -10 })).toContain(
      'Cost must be a valid non-negative financial amount'
    );
    expect(validateCreate({ ...validBody, status: 'Cancelled' })).toContain(
      'Status must be Active or Inactive'
    );
  });

  it('rejects invalid cycle on update', () => {
    expect(validateUpdate({ billingCycle: 'Quarterly' })).toContain(
      'Billing cycle must be Monthly or Annual'
    );
  });
});

describe('Subscription amount validation', () => {
  it('accepts zero and decimals, rejects negatives', () => {
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount('9.99')).toBe(true);
    expect(isValidAmount(-1)).toBe(false);
  });
});
