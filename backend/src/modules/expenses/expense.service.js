// Expense service layer — totals by category / department live here,
// never in controllers or React components. Integer minor units (cents),
// string-parsed conversion, no float math. No currency, tax, status, or
// payment-method rules (all undefined by the harness).

const Expense = require('./expense.model');
const { validateCreate, validateUpdate } = require('./expense.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

// { CategoryName: cents, ... } — insertion order follows first occurrence.
const totalsByCategory = (expenses) =>
  (Array.isArray(expenses) ? expenses : []).reduce((acc, exp) => {
    if (!exp || !exp.category) {
      return acc;
    }
    acc[exp.category] = (acc[exp.category] || 0) + (exp.amountCents || 0);
    return acc;
  }, {});

const totalsByDepartment = (expenses) =>
  (Array.isArray(expenses) ? expenses : []).reduce((acc, exp) => {
    if (!exp || !exp.department) {
      return acc;
    }
    acc[exp.department] = (acc[exp.department] || 0) + (exp.amountCents || 0);
    return acc;
  }, {});

const totalAmount = (expenses) =>
  (Array.isArray(expenses) ? expenses : []).reduce(
    (sum, exp) => sum + ((exp && exp.amountCents) || 0),
    0
  );

const toDTO = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(obj._id || obj.id),
    category: obj.category,
    description: obj.description,
    amount: toMajorUnits(obj.amountCents),
    amountCents: obj.amountCents,
    date: obj.date,
    vendor: obj.vendor,
    paymentMethod: obj.paymentMethod || null,
    department: obj.department,
    receipt: obj.receipt || null,
    status: obj.status || null,
    notes: obj.notes || null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

const trimOrNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const str = String(value).trim();
  return str === '' ? null : str;
};

const buildCreateData = (body) => ({
  category: body.category,
  description: String(body.description).trim(),
  amountCents: toMinorUnits(body.amount),
  date: new Date(body.date),
  vendor: String(body.vendor).trim(),
  paymentMethod: trimOrNull(body.paymentMethod),
  department: String(body.department).trim(),
  receipt: trimOrNull(body.receipt),
  status: trimOrNull(body.status),
  notes: trimOrNull(body.notes)
});

const buildUpdateData = (body) => {
  const data = {};
  if (body.category !== undefined) {
    data.category = body.category;
  }
  if (body.description !== undefined) {
    data.description = String(body.description).trim();
  }
  if (body.amount !== undefined) {
    data.amountCents = toMinorUnits(body.amount);
  }
  if (body.date !== undefined) {
    data.date = new Date(body.date);
  }
  if (body.vendor !== undefined) {
    data.vendor = String(body.vendor).trim();
  }
  if (body.paymentMethod !== undefined) {
    data.paymentMethod = trimOrNull(body.paymentMethod);
  }
  if (body.department !== undefined) {
    data.department = String(body.department).trim();
  }
  if (body.receipt !== undefined) {
    data.receipt = trimOrNull(body.receipt);
  }
  if (body.status !== undefined) {
    data.status = trimOrNull(body.status);
  }
  if (body.notes !== undefined) {
    data.notes = trimOrNull(body.notes);
  }
  return data;
};

const createExpense = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Expense.create(buildCreateData(body));
  return toDTO(doc);
};

const listExpenses = async (filter = {}) => {
  const query = {};
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.department) {
    query.department = new RegExp(filter.department, 'i');
  }
  const docs = await Expense.find(query).sort({ date: -1 }).lean();
  return docs.map(toDTO);
};

const getExpenseById = async (id) => {
  const doc = await Expense.findById(id).lean();
  return doc ? toDTO(doc) : null;
};

const updateExpense = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Expense.findByIdAndUpdate(id, buildUpdateData(body), {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc) : null;
};

const getSummary = async () => {
  const docs = await Expense.find({}).sort({ date: -1 }).lean();
  const byCategoryCents = totalsByCategory(docs);
  const byDepartmentCents = totalsByDepartment(docs);
  const totalCents = totalAmount(docs);
  const inMajor = (map) =>
    Object.fromEntries(Object.entries(map).map(([k, v]) => [k, toMajorUnits(v)]));
  return {
    byCategory: inMajor(byCategoryCents),
    byCategoryCents,
    byDepartment: inMajor(byDepartmentCents),
    byDepartmentCents,
    total: toMajorUnits(totalCents),
    totalCents,
    count: docs.length
  };
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  totalsByCategory,
  totalsByDepartment,
  totalAmount,
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  getSummary
};
