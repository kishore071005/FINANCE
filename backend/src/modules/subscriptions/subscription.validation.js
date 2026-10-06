// Subscription input validation at the API boundary. Pure, unit-testable.
// Required: service name, cost, billing cycle, renewal date.
// Billing cycle strictly Monthly / Annual. Status Active / Inactive
// (values per test-cases — human must confirm).

const ALLOWED_CYCLES = ['Monthly', 'Annual'];
const ALLOWED_STATUSES = ['Active', 'Inactive'];

const isValidCycle = (cycle) => ALLOWED_CYCLES.includes(cycle);
const isValidStatus = (status) => ALLOWED_STATUSES.includes(status);

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

  if (!body.serviceName || String(body.serviceName).trim() === '') {
    errors.push('Service name is required');
  }
  if (body.cost === undefined || body.cost === null || body.cost === '') {
    errors.push('Cost is required');
  } else if (!isValidAmount(body.cost)) {
    errors.push('Cost must be a valid non-negative financial amount');
  }
  if (!body.billingCycle) {
    errors.push('Billing cycle is required');
  } else if (!isValidCycle(body.billingCycle)) {
    errors.push('Billing cycle must be Monthly or Annual');
  }
  if (!body.renewalDate) {
    errors.push('Renewal date is required');
  } else if (!isValidDate(body.renewalDate)) {
    errors.push('Renewal date must be a valid date');
  }
  if (!isValidDate(body.startDate)) {
    errors.push('Start date must be a valid date');
  }
  if (body.status !== undefined && body.status !== null && body.status !== '') {
    if (!isValidStatus(body.status)) {
      errors.push('Status must be Active or Inactive');
    }
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.serviceName !== undefined && String(body.serviceName).trim() === '') {
    errors.push('Service name is required');
  }
  if (body.cost !== undefined && !isValidAmount(body.cost)) {
    errors.push('Cost must be a valid non-negative financial amount');
  }
  if (body.billingCycle !== undefined && !isValidCycle(body.billingCycle)) {
    errors.push('Billing cycle must be Monthly or Annual');
  }
  if (body.renewalDate !== undefined && !isValidDate(body.renewalDate)) {
    errors.push('Renewal date must be a valid date');
  }
  if (body.startDate !== undefined && !isValidDate(body.startDate)) {
    errors.push('Start date must be a valid date');
  }
  if (body.status !== undefined && !isValidStatus(body.status)) {
    errors.push('Status must be Active or Inactive');
  }

  return errors;
};

module.exports = {
  ALLOWED_CYCLES,
  ALLOWED_STATUSES,
  isValidCycle,
  isValidStatus,
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate
};
