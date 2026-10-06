// Vendor service layer — derived totals live here.
// totalPaidCents = sum of Paid payments; pendingCents = sum of Pending
// payments. Computed from payment records on every read, never stored.

const Vendor = require('./vendor.model');
const { validateCreate, validateUpdate, validatePayment } = require('./vendor.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

const totalPaid = (payments) =>
  (Array.isArray(payments) ? payments : [])
    .filter((p) => p && p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);

const totalPending = (payments) =>
  (Array.isArray(payments) ? payments : [])
    .filter((p) => p && p.status === 'Pending')
    .reduce((sum, p) => sum + (p.amountCents || 0), 0);

const toPaymentDTO = (payment) => ({
  id: String(payment._id || payment.id),
  amount: toMajorUnits(payment.amountCents),
  amountCents: payment.amountCents,
  status: payment.status,
  date: payment.date || null,
  reference: payment.reference || null
});

const toDTO = (doc, includePayments = false) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const payments = Array.isArray(obj.payments) ? obj.payments : [];
  const paidCents = totalPaid(payments);
  const pendingCents = totalPending(payments);
  const dto = {
    id: String(obj._id || obj.id),
    name: obj.name,
    contact: obj.contact,
    serviceProvided: obj.serviceProvided || null,
    paymentTerms: obj.paymentTerms,
    contract: obj.contract || null,
    totalPaid: toMajorUnits(paidCents),
    totalPaidCents: paidCents,
    pendingAmount: toMajorUnits(pendingCents),
    pendingCents,
    paymentCount: payments.length,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
  if (includePayments) {
    dto.payments = payments.map(toPaymentDTO);
  }
  return dto;
};

const trimOrNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const str = String(value).trim();
  return str === '' ? null : str;
};

const createVendor = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Vendor.create({
    name: String(body.name).trim(),
    contact: String(body.contact).trim(),
    serviceProvided: trimOrNull(body.serviceProvided),
    paymentTerms: String(body.paymentTerms).trim(),
    contract: trimOrNull(body.contract)
  });
  return toDTO(doc);
};

const listVendors = async (filter = {}) => {
  const query = {};
  if (filter.name) {
    query.name = new RegExp(filter.name, 'i');
  }
  const docs = await Vendor.find(query).sort({ name: 1 }).lean();
  return docs.map((d) => toDTO(d));
};

const getVendorById = async (id) => {
  const doc = await Vendor.findById(id).lean();
  return doc ? toDTO(doc, true) : null;
};

const updateVendor = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const data = {};
  if (body.name !== undefined) {
    data.name = String(body.name).trim();
  }
  if (body.contact !== undefined) {
    data.contact = String(body.contact).trim();
  }
  if (body.serviceProvided !== undefined) {
    data.serviceProvided = trimOrNull(body.serviceProvided);
  }
  if (body.paymentTerms !== undefined) {
    data.paymentTerms = String(body.paymentTerms).trim();
  }
  if (body.contract !== undefined) {
    data.contract = trimOrNull(body.contract);
  }
  const doc = await Vendor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc, true) : null;
};

const addPayment = async (id, body) => {
  const errors = validatePayment(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const entry = {
    amountCents: toMinorUnits(body.amount),
    status: body.status,
    date: body.date ? new Date(body.date) : null,
    reference: trimOrNull(body.reference)
  };
  const doc = await Vendor.findByIdAndUpdate(
    id,
    { $push: { payments: entry } },
    { new: true, runValidators: true }
  ).lean();
  return doc ? toDTO(doc, true) : null;
};

const listPayments = async (id) => {
  const doc = await Vendor.findById(id).lean();
  if (!doc) {
    return null;
  }
  const payments = Array.isArray(doc.payments) ? doc.payments : [];
  return payments.map(toPaymentDTO);
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  totalPaid,
  totalPending,
  createVendor,
  listVendors,
  getVendorById,
  updateVendor,
  addPayment,
  listPayments
};
