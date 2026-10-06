// Domain input validation at the API boundary. Pure, unit-testable.
// Required: domain name, registrar, renewal date, renewal cost,
// hosting provider, hosting cost. Status is free-text (no defined values).

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

  if (!body.domainName || String(body.domainName).trim() === '') {
    errors.push('Domain name is required');
  }
  if (!body.registrar || String(body.registrar).trim() === '') {
    errors.push('Registrar is required');
  }
  if (!body.renewalDate) {
    errors.push('Renewal date is required');
  } else if (!isValidDate(body.renewalDate)) {
    errors.push('Renewal date must be a valid date');
  }
  if (body.renewalCost === undefined || body.renewalCost === null || body.renewalCost === '') {
    errors.push('Renewal cost is required');
  } else if (!isValidAmount(body.renewalCost)) {
    errors.push('Renewal cost must be a valid non-negative financial amount');
  }
  if (!body.hostingProvider || String(body.hostingProvider).trim() === '') {
    errors.push('Hosting provider is required');
  }
  if (body.hostingCost === undefined || body.hostingCost === null || body.hostingCost === '') {
    errors.push('Hosting cost is required');
  } else if (!isValidAmount(body.hostingCost)) {
    errors.push('Hosting cost must be a valid non-negative financial amount');
  }
  if (!isValidDate(body.purchaseDate)) {
    errors.push('Purchase date must be a valid date');
  }

  return errors;
};

const validateUpdate = (body = {}) => {
  const errors = [];

  if (body.domainName !== undefined && String(body.domainName).trim() === '') {
    errors.push('Domain name is required');
  }
  if (body.registrar !== undefined && String(body.registrar).trim() === '') {
    errors.push('Registrar is required');
  }
  if (body.renewalDate !== undefined && !isValidDate(body.renewalDate)) {
    errors.push('Renewal date must be a valid date');
  }
  if (body.renewalCost !== undefined && !isValidAmount(body.renewalCost)) {
    errors.push('Renewal cost must be a valid non-negative financial amount');
  }
  if (body.hostingProvider !== undefined && String(body.hostingProvider).trim() === '') {
    errors.push('Hosting provider is required');
  }
  if (body.hostingCost !== undefined && !isValidAmount(body.hostingCost)) {
    errors.push('Hosting cost must be a valid non-negative financial amount');
  }
  if (body.purchaseDate !== undefined && !isValidDate(body.purchaseDate)) {
    errors.push('Purchase date must be a valid date');
  }

  return errors;
};

module.exports = {
  isValidAmount,
  isValidDate,
  validateCreate,
  validateUpdate
};
