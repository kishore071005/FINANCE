const {
  ALLOWED_CATEGORIES,
  isValidCategory,
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/expenses/expense.validation');

describe('Expense category validation', () => {
  it('accepts exactly the 13 harness categories', () => {
    expect(ALLOWED_CATEGORIES).toHaveLength(13);
    [
      'Salaries', 'SaaS', 'Software', 'Domain', 'Hosting', 'Cloud',
      'Hardware', 'Office', 'Marketing', 'Travel', 'Operations',
      'Professional services', 'Other'
    ].forEach((cat) => {
      expect(isValidCategory(cat)).toBe(true);
    });
  });

  it('rejects invented categories', () => {
    expect(isValidCategory('Crypto')).toBe(false);
    expect(isValidCategory('saas')).toBe(false);
    expect(isValidCategory('')).toBe(false);
    expect(isValidCategory(null)).toBe(false);
  });
});

describe('Expense amount validation (Test Case 10)', () => {
  it('accepts valid non-negative amounts', () => {
    expect(isValidAmount(15000)).toBe(true);
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount('99.99')).toBe(true);
  });

  it('rejects invalid / non-numeric values', () => {
    expect(isValidAmount('invalid')).toBe(false);
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount(undefined)).toBe(false);
  });

  it('rejects negative values', () => {
    expect(isValidAmount(-10)).toBe(false);
    expect(isValidAmount('-1.50')).toBe(false);
  });
});

describe('Expense required fields', () => {
  const validBody = {
    category: 'SaaS',
    description: 'Monthly subscription',
    amount: 100,
    date: '2026-02-01',
    vendor: 'Acme SaaS',
    department: 'Engineering'
  };

  it('accepts a complete expense', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('rejects missing category, amount, department, vendor', () => {
    const errors = validateCreate({ description: 'x', date: '2026-02-01' });
    expect(errors).toContain('Category is required');
    expect(errors).toContain('Amount is required');
    expect(errors).toContain('Vendor is required');
    expect(errors).toContain('Department is required');
  });

  it('rejects invalid category on create and update', () => {
    expect(validateCreate({ ...validBody, category: 'Crypto' })).toContain(
      'Category must be one of the allowed expense categories'
    );
    expect(validateUpdate({ category: 'Crypto' })).toContain(
      'Category must be one of the allowed expense categories'
    );
  });
});
