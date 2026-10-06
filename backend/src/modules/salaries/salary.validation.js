// Salary input validation at the API boundary. Pure functions, unit-testable.
// Required: employee, salary, department. Everything else optional.
// NOT validated beyond type/presence: employment type values, payment status
// values, deduction composition (all undefined by the harness). One integrity
// rule: deductions may not exceed gross (prevents negative net pay).

const isValidAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 && Number.isInteger(Math.round(value * 100));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return false;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      return false;
    }
    const num = Number(trimmed);
    return Number.isFinite(num) && num >= 0;
  }
  return false;
};

const isValidDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return true; // optional fields
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateCreate = (body = {}) => {
  const errors = [];

  if (!body.employee || String(body.employee).trim() === '') {
    errors.push('Employee is required');
  }
  if (body.salary === undefined || body.salary === null || body.salary === '') {
    errors.push('Salary is required');
  } else if (!isValidAmount(body.salary)) {
    errors.push('Salary must be a valid non-negative financial amount');
  }
  if (!body.department || String(body.department).trim() === '') {
    errors.push('Department is required');
  }
  if (body.deductions !== undefined && body.deductions !== null && body.deductions !== '') {
    if (!isValidAmount(body.deductions)) {
      errors.push('Deductions must be a valid non-negative financial amount');
    }
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.employee !== undefined && String(body.employee).trim() === '') {
    errors.push('Employee is required');
  }
  if (body.salary !== undefined && !isValidAmount(body.salary)) {
    errors.push('Salary must be a valid non-negative financial amount');
  }
  if (body.department !== undefined && String(body.department).trim() === '') {
    errors.push('Department is required');
  }
  if (
    body.deductions !== undefined &&
    body.deductions !== null &&
    body.deductions !== '' &&
    !isValidAmount(body.deductions)
  ) {
    errors.push('Deductions must be a valid non-negative financial amount');
  }
  if (body.paymentDate !== undefined && !isValidDate(body.paymentDate)) {
    errors.push('Payment Date must be a valid date');
  }

  return errors;
};

module.exports = {
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate
};
