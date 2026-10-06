// Budget service layer — remaining = budget − actual, integer cents.
// ACTUAL SPENDING DERIVATION (from real data, never invented):
//   actual(dept) = Σ expense.amountCents where expense.department matches
//                + Σ salary.netCents where salary.department matches
// Matching is case-insensitive exact match. No date/period filtering exists
// (no budget period is defined — flagged). Salary nets are monthly figures;
// expense amounts are as-recorded — the mix is documented, not adjusted.
// OVERRUN: remaining < 0. No alert/warning threshold (undefined — none built).

const Budget = require('./budget.model');
const Expense = require('../expenses/expense.model');
const Salary = require('../salaries/salary.model');
const { validateCreate, validateUpdate } = require('./budget.validation');

const toMinorUnits = (value) => {
  const str = String(value).trim();
  const [whole, fraction = ''] = str.split('.');
  const padded = (fraction + '00').slice(0, 2);
  return Number(whole) * 100 + Number(padded);
};

const toMajorUnits = (cents) => cents / 100;

const matchesDepartment = (recordDepartment, department) =>
  typeof recordDepartment === 'string' &&
  recordDepartment.toLowerCase() === String(department).toLowerCase();

const computeActual = (expenses, salaries, department) => {
  const expenseCents = (Array.isArray(expenses) ? expenses : [])
    .filter((e) => e && matchesDepartment(e.department, department))
    .reduce((sum, e) => sum + (e.amountCents || 0), 0);
  const salaryCents = (Array.isArray(salaries) ? salaries : [])
    .filter((s) => s && matchesDepartment(s.department, department))
    .reduce((sum, s) => sum + (s.netCents || 0), 0);
  return { expenseCents, salaryCents, actualCents: expenseCents + salaryCents };
};

const computeRemaining = (budgetCents, actualCents) => budgetCents - actualCents;
const isOverrun = (remainingCents) => remainingCents < 0;

const toDTO = (doc, expenses = [], salaries = []) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const { expenseCents, salaryCents, actualCents } = computeActual(
    expenses,
    salaries,
    obj.department
  );
  const remainingCents = computeRemaining(obj.budgetCents, actualCents);
  return {
    id: String(obj._id || obj.id),
    department: obj.department,
    budget: toMajorUnits(obj.budgetCents),
    budgetCents: obj.budgetCents,
    actualSpending: toMajorUnits(actualCents),
    actualSpendingCents: actualCents,
    expenseSpending: toMajorUnits(expenseCents),
    expenseSpendingCents: expenseCents,
    salarySpending: toMajorUnits(salaryCents),
    salarySpendingCents: salaryCents,
    remaining: toMajorUnits(remainingCents),
    remainingCents,
    overrun: isOverrun(remainingCents),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

const loadSourceData = async () => {
  const [expenses, salaries] = await Promise.all([
    Expense.find({}).lean(),
    Salary.find({}).lean()
  ]);
  return { expenses, salaries };
};

const createBudget = async (body) => {
  const errors = validateCreate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const doc = await Budget.create({
    department: body.department,
    budgetCents: toMinorUnits(body.budget)
  });
  const { expenses, salaries } = await loadSourceData();
  return toDTO(doc, expenses, salaries);
};

const listBudgets = async (filter = {}) => {
  const query = {};
  if (filter.department) {
    query.department = filter.department;
  }
  const [docs, { expenses, salaries }] = await Promise.all([
    Budget.find(query).sort({ department: 1 }).lean(),
    loadSourceData()
  ]);
  return docs.map((d) => toDTO(d, expenses, salaries));
};

const getBudgetById = async (id) => {
  const doc = await Budget.findById(id).lean();
  if (!doc) {
    return null;
  }
  const { expenses, salaries } = await loadSourceData();
  return toDTO(doc, expenses, salaries);
};

const updateBudget = async (id, body) => {
  const errors = validateUpdate(body);
  if (errors.length > 0) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = errors;
    throw err;
  }
  const data = {};
  if (body.department !== undefined) {
    data.department = body.department;
  }
  if (body.budget !== undefined) {
    data.budgetCents = toMinorUnits(body.budget);
  }
  const doc = await Budget.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
  if (!doc) {
    return null;
  }
  const { expenses, salaries } = await loadSourceData();
  return toDTO(doc, expenses, salaries);
};

const getSummary = async () => {
  const [docs, { expenses, salaries }] = await Promise.all([
    Budget.find({}).sort({ department: 1 }).lean(),
    loadSourceData()
  ]);
  const enriched = docs.map((d) => toDTO(d, expenses, salaries));
  const sum = (key) => enriched.reduce((total, b) => total + b[key], 0);
  return {
    budgets: enriched,
    totalBudget: toMajorUnits(sum('budgetCents')),
    totalBudgetCents: sum('budgetCents'),
    totalActual: toMajorUnits(sum('actualSpendingCents')),
    totalActualCents: sum('actualSpendingCents'),
    totalRemaining: toMajorUnits(sum('remainingCents')),
    totalRemainingCents: sum('remainingCents'),
    overrunDepartments: enriched.filter((b) => b.overrun).map((b) => b.department),
    count: enriched.length
  };
};

module.exports = {
  toMinorUnits,
  toMajorUnits,
  computeActual,
  computeRemaining,
  isOverrun,
  createBudget,
  listBudgets,
  getBudgetById,
  updateBudget,
  getSummary
};
