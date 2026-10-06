// Vendor input validation at the API boundary. Pure, unit-testable.
// Required: vendor name, contact, payment terms.
// Payment status Paid / Pending mirrors the requirements field names.

const ALLOWED_PAYMENT_STATUSES = ['Paid', 'Pending'];

const isValidPaymentStatus = (status) => ALLOWED_PAYMENT_STATUSES.includes(status);

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

  if (!body.name || String(body.name).trim() === '') {
    errors.push('Vendor name is required');
  }
  if (!body.contact || String(body.contact).trim() === '') {
    errors.push('Contact is required');
  }
  if (!body.paymentTerms || String(body.paymentTerms).trim() === '') {
    errors.push('Payment terms are required');
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.name !== undefined && String(body.name).trim() === '') {
    errors.push('Vendor name is required');
  }
  if (body.contact !== undefined && String(body.contact).trim() === '') {
    errors.push('Contact is required');
  }
  if (body.paymentTerms !== undefined && String(body.paymentTerms).trim() === '') {
    errors.push('Payment terms are required');
  }

  return errors;
};

const validatePayment = (body = {}) => {
  const errors = [];

  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push('Payment amount is required');
  } else if (!isValidAmount(body.amount)) {
    errors.push('Payment amount must be a valid non-negative financial amount');
  }
  if (!body.status) {
    errors.push('Payment status is required');
  } else if (!isValidPaymentStatus(body.status)) {
    errors.push('Payment status must be Paid or Pending');
  }
  if (!isValidDate(body.date)) {
    errors.push('Payment date must be a valid date');
  }

  return errors;
};

module.exports = {
  ALLOWED_PAYMENT_STATUSES,
  isValidPaymentStatus,
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate,
  validatePayment
};
