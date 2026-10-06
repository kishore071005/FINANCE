// Salary service layer — centralized calculations, integer minor units.
// net = gross − deductions (provided totals only; no tax/payroll rules).
// Department / employee summaries aggregate NET monthly cost.

const Salary = require('./salary.model');
const { validateCreate, validateUpdate } = require('./salary.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

const computeNet = (grossCents, deductionsCents) => grossCents - deductionsCents;

// Total monthly cost (net) across records.
const totalMonthlyCost = (records) =>
  (Array.isArray(records) ? records : []).reduce(
    (sum, r) => sum + ((r && r.netCents) || 0),
    0
  );

const totalsByDepartment = (records) =>
  (Array.isArray(records) ? records : []).reduce((acc, r) => {
    if (!r || !r.department) {
      return acc;
    }
    acc[r.department] = (acc[r.department] || 0) + (r.netCents || 0);
    return acc;
  }, {});

const totalsByEmployee = (records) =>
  (Array.isArray(records) ? records : []).reduce((acc, r) => {
    if (!r || !r.employee) {
      return acc;
    }
    acc[r.employee] = (acc[r.employee] || 0) + (r.netCents || 0);
    return acc;
  }, {});

const toDTO = (doc) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(obj._id || obj.id),
    employee: obj.employee,
    salary: toMajorUnits(obj.grossCents),
    grossCents: obj.grossCents,
    deductions: toMajorUnits(obj.deductionsCents || 0),
    deductionsCents: obj.deductionsCents || 0,
    monthlyCost: toMajorUnits(obj.netCents),
    netCents: obj.netCents,
    department: obj.department,
    employmentType: obj.employmentType || null,
    paymentStatus: obj.paymentStatus || null,
    paymentDate: obj.paymentDate || null,
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

const centsOrZero = (value) =>
  value === undefined || value === null || value === '' ? 0 : toMinorUnits(value);

const rejectOverDeduction = (grossCents, deductionsCents) => {
  if (deductionsCents > grossCents) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = ['Deductions cannot exceed gross salary'];
    throw err;
  }
};

const buildCreateData = (body) => {
  const grossCents = toMinorUnits(body.salary);
  const deductionsCents = centsOrZero(body.deductions);
  rejectOverDeduction(grossCents, deductionsCents);
  return {
    employee: String(body.employee).trim(),
    grossCents,
    department: String(body.department).trim(),
    employmentType: trimOrNull(body.employmentType),
    deductionsCents,
    netCents: computeNet(grossCents, deductionsCents),
    paymentStatus: trimOrNull(body.paymentStatus),
    paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
    notes: trimOrNull(body.notes)
  };
};

const createSalary = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Salary.create(buildCreateData(body));
  return toDTO(doc);
};

const listSalaries = async (filter = {}) => {
  const query = {};
  if (filter.department) {
    query.department = new RegExp(filter.department, 'i');
  }
  if (filter.employee) {
    query.employee = new RegExp(filter.employee, 'i');
  }
  const docs = await Salary.find(query).sort({ employee: 1 }).lean();
  return docs.map(toDTO);
};

const getSalaryById = async (id) => {
  const doc = await Salary.findById(id).lean();
  return doc ? toDTO(doc) : null;
};

const updateSalary = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const existing = await Salary.findById(id).lean();
  if (!existing) {
    return null;
  }
  const data = {};
  if (body.employee !== undefined) {
    data.employee = String(body.employee).trim();
  }
  if (body.department !== undefined) {
    data.department = String(body.department).trim();
  }
  if (body.employmentType !== undefined) {
    data.employmentType = trimOrNull(body.employmentType);
  }
  if (body.paymentStatus !== undefined) {
    data.paymentStatus = trimOrNull(body.paymentStatus);
  }
  if (body.paymentDate !== undefined) {
    data.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null;
  }
  if (body.notes !== undefined) {
    data.notes = trimOrNull(body.notes);
  }
  // Recompute net whenever gross or deductions change.
  const grossCents = body.salary !== undefined ? toMinorUnits(body.salary) : existing.grossCents;
  const deductionsCents =
    body.deductions !== undefined ? centsOrZero(body.deductions) : existing.deductionsCents || 0;
  rejectOverDeduction(grossCents, deductionsCents);
  if (body.salary !== undefined) {
    data.grossCents = grossCents;
  }
  if (body.deductions !== undefined) {
    data.deductionsCents = deductionsCents;
  }
  data.netCents = computeNet(grossCents, deductionsCents);

  const doc = await Salary.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
  return doc ? toDTO(doc) : null;
};

const getSummary = async () => {
  const docs = await Salary.find({}).sort({ employee: 1 }).lean();
  const byDepartmentCents = totalsByDepartment(docs);
  const byEmployeeCents = totalsByEmployee(docs);
  const totalCents = totalMonthlyCost(docs);
  const inMajor = (map) =>
    Object.fromEntries(Object.entries(map).map(([k, v]) => [k, toMajorUnits(v)]));
  return {
    byDepartment: inMajor(byDepartmentCents),
    byDepartmentCents,
    byEmployee: inMajor(byEmployeeCents),
    byEmployeeCents,
    totalMonthlyCost: toMajorUnits(totalCents),
    totalMonthlyCostCents: totalCents,
    count: docs.length
  };
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  computeNet,
  totalMonthlyCost,
  totalsByDepartment,
  totalsByEmployee,
  createSalary,
  listSalaries,
  getSalaryById,
  updateSalary,
  getSummary
};
