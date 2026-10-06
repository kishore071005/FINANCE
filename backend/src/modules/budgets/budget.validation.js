// Budget input validation at the API boundary. Pure, unit-testable.
// Department strictly from the harness list of six.

const ALLOWED_DEPARTMENTS = ['HR', 'Sales', 'Marketing', 'Operations', 'Technology', 'Other'];

const isValidDepartment = (department) => ALLOWED_DEPARTMENTS.includes(department);

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

const validateCreate = (body = {}) => {
  const errors = [];

  if (!body.department) {
    errors.push('Department is required');
  } else if (!isValidDepartment(body.department)) {
    errors.push('Department must be one of: HR, Sales, Marketing, Operations, Technology, Other');
  }
  if (body.budget === undefined || body.budget === null || body.budget === '') {
    errors.push('Budget is required');
  } else if (!isValidAmount(body.budget)) {
    errors.push('Budget must be a valid non-negative financial amount');
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.department !== undefined && !isValidDepartment(body.department)) {
    errors.push('Department must be one of: HR, Sales, Marketing, Operations, Technology, Other');
  }
  if (body.budget !== undefined && !isValidAmount(body.budget)) {
    errors.push('Budget must be a valid non-negative financial amount');
  }

  return errors;
};

module.exports = {
  ALLOWED_DEPARTMENTS,
  isValidDepartment,
  isValidAmount,
  validateCreate,
  validateUpdate
};
