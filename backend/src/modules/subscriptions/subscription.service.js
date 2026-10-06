// Subscription service layer — cost normalization lives here.
// EXPLICIT FORMULA (documented): Monthly → monthly = cost as-is;
// Annual → monthly = round(cost / 12) in integer cents.
// No renewal time window: "upcoming" = Active with renewalDate >= today,
// sorted ascending, no day-cutoff (window undefined — flagged).

const Subscription = require('./subscription.model');
const { validateCreate, validateUpdate } = require('./subscription.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

// Explicit documented normalization. Annual amounts that do not divide
// evenly are rounded to the nearest cent (Math.round, half up).
const normalizeMonthly = (costCents, billingCycle) => {
  if (billingCycle === 'Annual') {
    return Math.round(costCents / 12);
  }
  return costCents;
};

const totalMonthlyCost = (subscriptions) =>
  (Array.isArray(subscriptions) ? subscriptions : []).reduce(
    (sum, s) => sum + ((s && s.normalizedMonthlyCents) || 0),
    0
  );

// Display set only: Active subscriptions renewing today or later, soonest first.
// No status mutation, no window cutoff.
const upcomingRenewals = (subscriptions, now = new Date()) => {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return (Array.isArray(subscriptions) ? subscriptions : [])
    .filter(
      (s) =>
        s &&
        s.status === 'Active' &&
        s.renewalDate &&
        new Date(s.renewalDate).getTime() >= startOfToday.getTime()
    )
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
};

const toDTO = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(obj._id || obj.id),
    serviceName: obj.serviceName,
    provider: obj.provider || null,
    category: obj.category || null,
    cost: toMajorUnits(obj.costCents),
    costCents: obj.costCents,
    billingCycle: obj.billingCycle,
    monthlyCost: toMajorUnits(obj.normalizedMonthlyCents),
    normalizedMonthlyCents: obj.normalizedMonthlyCents,
    startDate: obj.startDate || null,
    renewalDate: obj.renewalDate,
    paymentMethod: obj.paymentMethod || null,
    owner: obj.owner || null,
    department: obj.department || null,
    status: obj.status,
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

const buildCreateData = (body) => {
  const costCents = toMinorUnits(body.cost);
  return {
    serviceName: String(body.serviceName).trim(),
    provider: trimOrNull(body.provider),
    category: trimOrNull(body.category),
    costCents,
    billingCycle: body.billingCycle,
    normalizedMonthlyCents: normalizeMonthly(costCents, body.billingCycle),
    startDate: body.startDate ? new Date(body.startDate) : null,
    renewalDate: new Date(body.renewalDate),
    paymentMethod: trimOrNull(body.paymentMethod),
    owner: trimOrNull(body.owner),
    department: trimOrNull(body.department),
    status: body.status || 'Active'
  };
};

const createSubscription = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Subscription.create(buildCreateData(body));
  return toDTO(doc);
};

const listSubscriptions = async (filter = {}) => {
  const query = {};
  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.billingCycle) {
    query.billingCycle = filter.billingCycle;
  }
  const docs = await Subscription.find(query).sort({ renewalDate: 1 }).lean();
  return docs.map(toDTO);
};

const getSubscriptionById = async (id) => {
  const doc = await Subscription.findById(id).lean();
  return doc ? toDTO(doc) : null;
};

const updateSubscription = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const existing = await Subscription.findById(id).lean();
  if (!existing) {
    return null;
  }
  const data = {};
  if (body.serviceName !== undefined) {
    data.serviceName = String(body.serviceName).trim();
  }
  if (body.provider !== undefined) {
    data.provider = trimOrNull(body.provider);
  }
  if (body.category !== undefined) {
    data.category = trimOrNull(body.category);
  }
  if (body.startDate !== undefined) {
    data.startDate = body.startDate ? new Date(body.startDate) : null;
  }
  if (body.renewalDate !== undefined) {
    data.renewalDate = new Date(body.renewalDate);
  }
  if (body.paymentMethod !== undefined) {
    data.paymentMethod = trimOrNull(body.paymentMethod);
  }
  if (body.owner !== undefined) {
    data.owner = trimOrNull(body.owner);
  }
  if (body.department !== undefined) {
    data.department = trimOrNull(body.department);
  }
  if (body.status !== undefined) {
    data.status = body.status;
  }
  // Recompute normalization whenever cost or cycle changes.
  const costCents = body.cost !== undefined ? toMinorUnits(body.cost) : existing.costCents;
  const billingCycle = body.billingCycle !== undefined ? body.billingCycle : existing.billingCycle;
  if (body.cost !== undefined) {
    data.costCents = costCents;
  }
  if (body.billingCycle !== undefined) {
    data.billingCycle = billingCycle;
  }
  data.normalizedMonthlyCents = normalizeMonthly(costCents, billingCycle);

  const doc = await Subscription.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc) : null;
};

const getSummary = async (now = new Date()) => {
  const docs = await Subscription.find({}).sort({ renewalDate: 1 }).lean();
  const active = docs.filter((d) => d.status === 'Active');
  const totalCents = totalMonthlyCost(active);
  const upcoming = upcomingRenewals(docs, now).map(toDTO);
  return {
    totalMonthly: toMajorUnits(totalCents),
    totalMonthlyCents: totalCents,
    activeCount: active.length,
    totalCount: docs.length,
    upcomingRenewals: upcoming
  };
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  normalizeMonthly,
  totalMonthlyCost,
  upcomingRenewals,
  createSubscription,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  getSummary
};
