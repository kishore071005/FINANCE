// Revenue service layer — all business logic lives here, never in
// controllers or React components.
// Monetary precision: integer minor units (cents). Conversion uses string
// parsing so values like 19.99 or 0.1+0.2 cases never touch binary floats.
//
// Deliberately NOT implemented (harness forbids guessing):
// - No automatic Pending -> Overdue transition (exact rule undefined).
// - No tax calculation (tax stored as provided).
// - No currency handling. No invoice-number uniqueness enforcement.

const Revenue = require('./revenue.model');
const { validateCreate, validateUpdate } = require('./revenue.validation');

// Convert major-unit decimal (number|string) to integer minor units.
const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

// Sum of Paid invoices only, computed in integer cents.
const totalRevenuePaid = (invoices) =>
  (Array.isArray(invoices) ? invoices : [])
    .filter((inv) => inv && inv.paymentStatus === 'Paid')
    .reduce((sum, inv) => sum + (inv.amountCents || 0), 0);

// Display hint only: past due date with no payment recorded.
// Does NOT change stored status — transition rules are undefined.
const isPastDue = (invoice) => {
  if (!invoice || !invoice.dueDate || invoice.paymentDate) {
    return false;
  }
  return new Date(invoice.dueDate).getTime() < Date.now() &&
    (invoice.paymentStatus === 'Pending' || invoice.paymentStatus === 'Partially Paid');
};

const toDTO = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(obj._id || obj.id),
    customer: obj.customer,
    invoiceNumber: obj.invoiceNumber,
    invoiceDate: obj.invoiceDate,
    amount: toMajorUnits(obj.amountCents),
    amountCents: obj.amountCents,
    tax: toMajorUnits(obj.taxCents || 0),
    taxCents: obj.taxCents || 0,
    dueDate: obj.dueDate || null,
    paymentDate: obj.paymentDate || null,
    paymentStatus: obj.paymentStatus,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

const buildCreateData = (body) => {
  const data = {
    customer: String(body.customer).trim(),
    invoiceNumber: String(body.invoiceNumber).trim(),
    invoiceDate: new Date(body.invoiceDate),
    amountCents: toMinorUnits(body.amount),
    taxCents: body.tax === undefined || body.tax === null || body.tax === '' ? 0 : toMinorUnits(body.tax),
    paymentStatus: body.paymentStatus || 'Pending'
  };
  if (body.dueDate) {
    data.dueDate = new Date(body.dueDate);
  }
  if (body.paymentDate) {
    data.paymentDate = new Date(body.paymentDate);
  }
  return data;
};

const buildUpdateData = (body) => {
  const data = {};
  if (body.customer !== undefined) {
    data.customer = String(body.customer).trim();
  }
  if (body.invoiceNumber !== undefined) {
    data.invoiceNumber = String(body.invoiceNumber).trim();
  }
  if (body.invoiceDate !== undefined) {
    data.invoiceDate = new Date(body.invoiceDate);
  }
  if (body.amount !== undefined) {
    data.amountCents = toMinorUnits(body.amount);
  }
  if (body.tax !== undefined) {
    data.taxCents = body.tax === null || body.tax === '' ? 0 : toMinorUnits(body.tax);
  }
  if (body.paymentStatus !== undefined) {
    data.paymentStatus = body.paymentStatus;
  }
  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }
  if (body.paymentDate !== undefined) {
    data.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null;
  }
  return data;
};

const createInvoice = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Revenue.create(buildCreateData(body));
  return toDTO(doc);
};

const listInvoices = async (filter = {}) => {
  const query = {};
  if (filter.paymentStatus) {
    query.paymentStatus = filter.paymentStatus;
  }
  if (filter.customer) {
    query.customer = new RegExp(filter.customer, 'i');
  }
  const docs = await Revenue.find(query).sort({ invoiceDate: -1 }).lean();
  return docs.map(toDTO);
};

const getInvoiceById = async (id) => {
  const doc = await Revenue.findById(id).lean();
  return doc ? toDTO(doc) : null;
};

const updateInvoice = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Revenue.findByIdAndUpdate(id, buildUpdateData(body), {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc) : null;
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  totalRevenuePaid,
  isPastDue,
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoice
};
