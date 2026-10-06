// Expense input validation at the API boundary. Pure functions, unit-testable.
// Strict: only the 13 harness categories, non-negative amounts.
// NOT validated (harness leaves undefined): status values, payment methods,
// receipt storage mechanism, department master data, currency.

const ALLOWED_CATEGORIES = [
  'Salaries',
  'SaaS',
  'Software',
  'Domain',
  'Hosting',
  'Cloud',
  'Hardware',
  'Office',
  'Marketing',
  'Travel',
  'Operations',
  'Professional services',
  'Other'
];

const isValidCategory = (category) => ALLOWED_CATEGORIES.includes(category);

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

  if (!body.category || String(body.category).trim() === '') {
    errors.push('Category is required');
  } else if (!isValidCategory(body.category)) {
    errors.push('Category must be one of the allowed expense categories');
  }
  if (!body.description || String(body.description).trim() === '') {
    errors.push('Description is required');
  }
  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push('Amount is required');
  } else if (!isValidAmount(body.amount)) {
    errors.push('Amount must be a valid non-negative financial amount');
  }
  if (!body.date) {
    errors.push('Date is required');
  } else if (!isValidDate(body.date)) {
    errors.push('Date must be a valid date');
  }
  if (!body.vendor || String(body.vendor).trim() === '') {
    errors.push('Vendor is required');
  }
  if (!body.department || String(body.department).trim() === '') {
    errors.push('Department is required');
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.category !== undefined) {
    if (String(body.category).trim() === '') {
      errors.push('Category is required');
    } else if (!isValidCategory(body.category)) {
      errors.push('Category must be one of the allowed expense categories');
    }
  }
  if (body.description !== undefined && String(body.description).trim() === '') {
    errors.push('Description is required');
  }
  if (body.amount !== undefined && !isValidAmount(body.amount)) {
    errors.push('Amount must be a valid non-negative financial amount');
  }
  if (body.date !== undefined && !isValidDate(body.date)) {
    errors.push('Date must be a valid date');
  }
  if (body.vendor !== undefined && String(body.vendor).trim() === '') {
    errors.push('Vendor is required');
  }
  if (body.department !== undefined && String(body.department).trim() === '') {
    errors.push('Department is required');
  }

  return errors;
};

module.exports = {
  ALLOWED_CATEGORIES,
  isValidCategory,
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate
};
