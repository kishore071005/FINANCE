// Domain service layer — cost totals and renewal visibility live here.
// Integer minor units. No renewal time window: upcoming = renewalDate >=
// today, soonest first, no day-cutoff (window undefined — flagged).

const Domain = require('./domain.model');
const { validateCreate, validateUpdate } = require('./domain.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

const totalRenewalCost = (domains) =>
  (Array.isArray(domains) ? domains : []).reduce(
    (sum, d) => sum + ((d && d.renewalCostCents) || 0),
    0
  );

const totalHostingCost = (domains) =>
  (Array.isArray(domains) ? domains : []).reduce(
    (sum, d) => sum + ((d && d.hostingCostCents) || 0),
    0
  );

const upcomingRenewals = (domains, now = new Date()) => {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return (Array.isArray(domains) ? domains : [])
    .filter(
      (d) =>
        d && d.renewalDate && new Date(d.renewalDate).getTime() >= startOfToday.getTime()
    )
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
};

const toDTO = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(obj._id || obj.id),
    domainName: obj.domainName,
    registrar: obj.registrar,
    purchaseDate: obj.purchaseDate || null,
    renewalDate: obj.renewalDate,
    renewalCost: toMajorUnits(obj.renewalCostCents),
    renewalCostCents: obj.renewalCostCents,
    hostingProvider: obj.hostingProvider,
    hostingCost: toMajorUnits(obj.hostingCostCents),
    hostingCostCents: obj.hostingCostCents,
    status: obj.status || null,
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
  domainName: String(body.domainName).trim(),
  registrar: String(body.registrar).trim(),
  purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
  renewalDate: new Date(body.renewalDate),
  renewalCostCents: toMinorUnits(body.renewalCost),
  hostingProvider: String(body.hostingProvider).trim(),
  hostingCostCents: toMinorUnits(body.hostingCost),
  status: trimOrNull(body.status)
});

const createDomain = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Domain.create(buildCreateData(body));
  return toDTO(doc);
};

const listDomains = async (filter = {}) => {
  const query = {};
  if (filter.registrar) {
    query.registrar = new RegExp(filter.registrar, 'i');
  }
  const docs = await Domain.find(query).sort({ renewalDate: 1 }).lean();
  return docs.map(toDTO);
};

const getDomainById = async (id) => {
  const doc = await Domain.findById(id).lean();
  return doc ? toDTO(doc) : null;
};

const updateDomain = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const data = {};
  if (body.domainName !== undefined) {
    data.domainName = String(body.domainName).trim();
  }
  if (body.registrar !== undefined) {
    data.registrar = String(body.registrar).trim();
  }
  if (body.purchaseDate !== undefined) {
    data.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
  }
  if (body.renewalDate !== undefined) {
    data.renewalDate = new Date(body.renewalDate);
  }
  if (body.renewalCost !== undefined) {
    data.renewalCostCents = toMinorUnits(body.renewalCost);
  }
  if (body.hostingProvider !== undefined) {
    data.hostingProvider = String(body.hostingProvider).trim();
  }
  if (body.hostingCost !== undefined) {
    data.hostingCostCents = toMinorUnits(body.hostingCost);
  }
  if (body.status !== undefined) {
    data.status = trimOrNull(body.status);
  }
  const doc = await Domain.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc) : null;
};

const getSummary = async (now = new Date()) => {
  const docs = await Domain.find({}).sort({ renewalDate: 1 }).lean();
  const renewalCents = totalRenewalCost(docs);
  const hostingCents = totalHostingCost(docs);
  return {
    totalRenewalCost: toMajorUnits(renewalCents),
    totalRenewalCostCents: renewalCents,
    totalHostingCost: toMajorUnits(hostingCents),
    totalHostingCostCents: hostingCents,
    count: docs.length,
    upcomingRenewals: upcomingRenewals(docs, now).map(toDTO)
  };
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  totalRenewalCost,
  totalHostingCost,
  upcomingRenewals,
  createDomain,
  listDomains,
  getDomainById,
  updateDomain,
  getSummary
};
