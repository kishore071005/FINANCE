const {
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/domains/domain.validation');

describe('Domain required field validation', () => {
  const validBody = {
    domainName: 'example.com',
    registrar: 'Namecheap',
    renewalDate: '2026-12-01',
    renewalCost: 12.99,
    hostingProvider: 'Vercel',
    hostingCost: 20
  };

  it('creates a domain with required fields → no errors', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('missing domain name → validation error', () => {
    expect(validateCreate({ ...validBody, domainName: undefined })).toContain(
      'Domain name is required'
    );
    expect(validateCreate({ ...validBody, domainName: '  ' })).toContain(
      'Domain name is required'
    );
  });

  it('rejects missing registrar, renewal date/cost, hosting fields', () => {
    const errors = validateCreate({ domainName: 'example.com' });
    expect(errors).toContain('Registrar is required');
    expect(errors).toContain('Renewal date is required');
    expect(errors).toContain('Renewal cost is required');
    expect(errors).toContain('Hosting provider is required');
    expect(errors).toContain('Hosting cost is required');
  });

  it('rejects invalid and negative costs', () => {
    expect(validateCreate({ ...validBody, renewalCost: 'invalid' })).toContain(
      'Renewal cost must be a valid non-negative financial amount'
    );
    expect(validateCreate({ ...validBody, hostingCost: -5 })).toContain(
      'Hosting cost must be a valid non-negative financial amount'
    );
  });

  it('rejects invalid dates and blank fields on update', () => {
    expect(validateCreate({ ...validBody, renewalDate: 'not-a-date' })).toContain(
      'Renewal date must be a valid date'
    );
    expect(validateUpdate({ registrar: '' })).toContain('Registrar is required');
    expect(validateUpdate({ hostingCost: 'abc' })).toContain(
      'Hosting cost must be a valid non-negative financial amount'
    );
  });

  it('accepts zero costs', () => {
    expect(
      validateCreate({ ...validBody, renewalCost: 0, hostingCost: '0' })
    ).toEqual([]);
  });
});
