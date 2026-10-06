const {
  ALLOWED_DEPARTMENTS,
  isValidDepartment,
  isValidAmount,
  validateCreate,
  validateUpdate
} = require('../../backend/src/modules/budgets/budget.validation');

describe('Budget department validation', () => {
  it('accepts exactly the six harness departments', () => {
    expect(ALLOWED_DEPARTMENTS).toEqual(
      ['HR', 'Sales', 'Marketing', 'Operations', 'Technology', 'Other']
    );
    ALLOWED_DEPARTMENTS.forEach((d) => {
      expect(isValidDepartment(d)).toBe(true);
    });
  });

  it('rejects other departments', () => {
    expect(isValidDepartment('Engineering')).toBe(false);
    expect(isValidDepartment('technology')).toBe(false);
    expect(isValidDepartment('')).toBe(false);
  });
});

describe('Budget required field validation', () => {
  it('accepts a complete budget', () => {
    expect(validateCreate({ department: 'Technology', budget: 100000 })).toEqual([]);
  });

  it('rejects missing department and budget', () => {
    const errors = validateCreate({});
    expect(errors).toContain('Department is required');
    expect(errors).toContain('Budget is required');
  });

  it('rejects invalid department and amounts', () => {
    expect(validateCreate({ department: 'Engineering', budget: 100 })).toContain(
      'Department must be one of: HR, Sales, Marketing, Operations, Technology, Other'
    );
    expect(validateCreate({ department: 'HR', budget: 'invalid' })).toContain(
      'Budget must be a valid non-negative financial amount'
    );
    expect(validateCreate({ department: 'HR', budget: -1 })).toContain(
      'Budget must be a valid non-negative financial amount'
    );
  });

  it('rejects invalid updates', () => {
    expect(validateUpdate({ department: 'Finance' })).toContain(
      'Department must be one of: HR, Sales, Marketing, Operations, Technology, Other'
    );
    expect(validateUpdate({ budget: -5 })).toContain(
      'Budget must be a valid non-negative financial amount'
    );
  });

  it('accepts zero budgets', () => {
    expect(validateCreate({ department: 'Other', budget: 0 })).toEqual([]);
  });
});
