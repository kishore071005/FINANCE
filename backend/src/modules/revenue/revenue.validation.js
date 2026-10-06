// Revenue input validation at the API boundary.
// Pure functions (no DB access) so they are unit-testable.
// Strict rules: only 4 statuses, non-negative amounts, customer required.
// Anything undefined by the harness (currency, tax rules, overdue transitions,
// invoice uniqueness) is NOT validated here and is flagged for the human.

const ALLOWED_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue'];

const isValidStatus = (status) => ALLOWED_STATUSES.includes(status);

// Accepts numbers or numeric strings with at most 2 decimal places.
// Rejects: non-numeric, negative, NaN, Infinity, more than 2 decimals.
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

  if (!body.customer || String(body.customer).trim() === '') {
    errors.push('Customer is required');
  }
  if (!body.invoiceNumber || String(body.invoiceNumber).trim() === '') {
    errors.push('Invoice Number is required');
  }
  if (!body.invoiceDate) {
    errors.push('Invoice Date is required');
  } else if (!isValidDate(body.invoiceDate)) {
    errors.push('Invoice Date must be a valid date');
  }
  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push('Amount is required');
  } else if (!isValidAmount(body.amount)) {
    errors.push('Amount must be a valid non-negative financial amount');
  }
  if (body.tax !== undefined && body.tax !== null && body.tax !== '' && !isValidAmount(body.tax)) {
    errors.push('Tax must be a valid non-negative financial amount');
  }
  if (body.paymentStatus !== undefined && body.paymentStatus !== null && body.paymentStatus !== '') {
    if (!isValidStatus(body.paymentStatus)) {
      errors.push('Payment Status must be one of: Pending, Partially Paid, Paid, Overdue');
    }
  }
  if (!isValidDate(body.dueDate)) {
    errors.push('Payment Due Date must be a valid date');
  }
  if (!isValidDate(body.paymentDate)) {
    errors.push('Payment Date must be a valid date');
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.customer !== undefined && String(body.customer).trim() === '') {
    errors.push('Customer is required');
  }
  if (body.invoiceNumber !== undefined && String(body.invoiceNumber).trim() === '') {
    errors.push('Invoice Number is required');
  }
  if (body.invoiceDate !== undefined && !isValidDate(body.invoiceDate)) {
    errors.push('Invoice Date must be a valid date');
  }
  if (body.amount !== undefined && !isValidAmount(body.amount)) {
    errors.push('Amount must be a valid non-negative financial amount');
  }
  if (body.tax !== undefined && body.tax !== null && body.tax !== '' && !isValidAmount(body.tax)) {
    errors.push('Tax must be a valid non-negative financial amount');
  }
  if (body.paymentStatus !== undefined && !isValidStatus(body.paymentStatus)) {
    errors.push('Payment Status must be one of: Pending, Partially Paid, Paid, Overdue');
  }
  if (body.dueDate !== undefined && !isValidDate(body.dueDate)) {
    errors.push('Payment Due Date must be a valid date');
  }
  if (body.paymentDate !== undefined && !isValidDate(body.paymentDate)) {
    errors.push('Payment Date must be a valid date');
  }

  return errors;
};

module.exports = {
  ALLOWED_STATUSES,
  isValidStatus,
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate
};
