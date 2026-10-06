const {
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/salaries/salary.validation');

describe('Salary required field validation', () => {
  const validBody = {
    employee: 'Employee A',
    salary: 50000,
    department: 'Engineering'
  };

  it('accepts a complete salary record', () => {
    expect(validateCreate(validBody)).toEqual([]);
  });

  it('rejects missing employee, salary, department', () => {
    const errors = validateCreate({});
    expect(errors).toContain('Employee is required');
    expect(errors).toContain('Salary is required');
    expect(errors).toContain('Department is required');
  });

  it('rejects invalid and negative salary amounts', () => {
    expect(validateCreate({ ...validBody, salary: 'invalid' })).toContain(
      'Salary must be a valid non-negative financial amount'
    );
    expect(validateCreate({ ...validBody, salary: -100 })).toContain(
      'Salary must be a valid non-negative financial amount'
    );
  });

  it('rejects invalid deductions', () => {
    expect(validateCreate({ ...validBody, deductions: 'abc' })).toContain(
      'Deductions must be a valid non-negative financial amount'
    );
    expect(validateCreate({ ...validBody, deductions: -50 })).toContain(
      'Deductions must be a valid non-negative financial amount'
    );
  });

  it('accepts optional deductions of zero', () => {
    expect(validateCreate({ ...validBody, deductions: 0 })).toEqual([]);
  });

  it('rejects blank fields on update', () => {
    expect(validateUpdate({ employee: '  ' })).toContain('Employee is required');
    expect(validateUpdate({ salary: -1 })).toContain(
      'Salary must be a valid non-negative financial amount'
    );
  });
});
