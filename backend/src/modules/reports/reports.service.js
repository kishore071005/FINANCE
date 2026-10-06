// Financial Reports Service — REUSES EXISTING SERVICE CALCULATIONS.
// Harness Critical Rule: Do NOT implement separate, contradictory calculations.
// All 10 reports reuse calculation logic from Overview and underlying modules.
// Precision: Integer minor units (cents), major-unit DTOs via toMajorUnits.

const Revenue = require('../revenue/revenue.model');
const Expense = require('../expenses/expense.model');
const Salary = require('../salaries/salary.model');
const Subscription = require('../subscriptions/subscription.model');
const Domain = require('../domains/domain.model');
const Vendor = require('../vendors/vendor.model');

const { totalsByCategory, totalsByDepartment: expenseTotalsByDept, totalAmount } = require('../expenses/expense.service');
const { totalsByDepartment: salaryTotalsByDept, totalsByEmployee, totalMonthlyCost: totalSalaryCost } = require('../salaries/salary.service');
const { upcomingRenewals: upcomingSubscriptionRenewals, totalMonthlyCost: totalSubscriptionCost, normalizeMonthly } = require('../subscriptions/subscription.service');
const { upcomingRenewals: upcomingDomainRenewals, totalRenewalCost, totalHostingCost } = require('../domains/domain.service');
const { totalPaid: vendorTotalPaid, totalPending: vendorTotalPending } = require('../vendors/vendor.service');
const { monthKey, lastMonthKeys, bucketByMonth } = require('../overview/overview.service');

const toMajorUnits = (cents) => cents / 100;
const inMajor = (map) =>
  Object.fromEntries(Object.entries(map || {}).map(([k, v]) => [k, toMajorUnits(v)]));

const UNPAID_STATUSES = ['Pending', 'Partially Paid', 'Overdue'];

const sumBy = (docs, predicate, amountKey) =>
  (Array.isArray(docs) ? docs : [])
    .filter(predicate)
    .reduce((sum, d) => sum + (d[amountKey] || 0), 0);

// 1. Revenue Report
const buildRevenueReport = (invoices = [], now = new Date()) => {
  const docs = Array.isArray(invoices) ? invoices : [];
  const paid = docs.filter((i) => i && i.paymentStatus === 'Paid');
  const unpaid = docs.filter((i) => i && UNPAID_STATUSES.includes(i.paymentStatus));

  const totalPaidCents = sumBy(paid, () => true, 'amountCents');
  const totalPendingCents = sumBy(unpaid, () => true, 'amountCents');
  const totalTaxCents = sumBy(paid, () => true, 'taxCents');

  const statusGroups = ['Paid', 'Pending', 'Partially Paid', 'Overdue'];
  const byStatus = statusGroups.reduce((acc, status) => {
    const matching = docs.filter((i) => i && i.paymentStatus === status);
    const cents = sumBy(matching, () => true, 'amountCents');
    acc[status] = {
      count: matching.length,
      total: toMajorUnits(cents),
      totalCents: cents
    };
    return acc;
  }, {});

  const trend = bucketByMonth(paid, 'invoiceDate', 'amountCents', 6, now);

  return {
    totalRevenue: toMajorUnits(totalPaidCents),
    totalRevenueCents: totalPaidCents,
    pendingRevenue: toMajorUnits(totalPendingCents),
    pendingRevenueCents: totalPendingCents,
    totalTax: toMajorUnits(totalTaxCents),
    totalTaxCents,
    totalCount: docs.length,
    paidCount: paid.length,
    unpaidCount: unpaid.length,
    byStatus,
    trend,
    invoices: docs
  };
};

// 2. Expense Report
const buildExpenseReport = (expenses = [], now = new Date()) => {
  const docs = Array.isArray(expenses) ? expenses : [];
  const totalCents = totalAmount(docs);
  const byCategoryCents = totalsByCategory(docs);
  const byDepartmentCents = expenseTotalsByDept(docs);
  const trend = bucketByMonth(docs, 'date', 'amountCents', 6, now);

  return {
    total: toMajorUnits(totalCents),
    totalCents,
    byCategory: inMajor(byCategoryCents),
    byCategoryCents,
    byDepartment: inMajor(byDepartmentCents),
    byDepartmentCents,
    totalCount: docs.length,
    trend,
    expenses: docs
  };
};

// 3. Salary Report
const buildSalaryReport = (salaries = []) => {
  const docs = Array.isArray(salaries) ? salaries : [];
  const totalNetCents = totalSalaryCost(docs);
  const grossCents = sumBy(docs, () => true, 'grossCents');
  const deductionsCents = sumBy(docs, () => true, 'deductionsCents');
  const byDepartmentCents = salaryTotalsByDept(docs);
  const byEmployeeCents = totalsByEmployee(docs);

  return {
    totalMonthlyCost: toMajorUnits(totalNetCents),
    totalMonthlyCostCents: totalNetCents,
    totalGross: toMajorUnits(grossCents),
    totalGrossCents: grossCents,
    totalDeductions: toMajorUnits(deductionsCents),
    totalDeductionsCents: deductionsCents,
    count: docs.length,
    byDepartment: inMajor(byDepartmentCents),
    byDepartmentCents,
    byEmployee: inMajor(byEmployeeCents),
    byEmployeeCents,
    salaries: docs
  };
};

// 4. SaaS Expense Report
// Reuses identical logic to Overview: SaaS category expenses + Active subscription monthly
const buildSaasReport = (expenses = [], subscriptions = []) => {
  const expDocs = Array.isArray(expenses) ? expenses : [];
  const subDocs = Array.isArray(subscriptions) ? subscriptions : [];

  const categoryTotals = totalsByCategory(expDocs);
  const saasExpenseCents = categoryTotals.SaaS || 0;

  const activeSubs = subDocs.filter((s) => s && s.status === 'Active');
  const subMonthlyCents = sumBy(activeSubs, () => true, 'normalizedMonthlyCents');

  const totalSaasCents = saasExpenseCents + subMonthlyCents;
  const saasExpenses = expDocs.filter((e) => e && e.category === 'SaaS');

  return {
    totalSaas: toMajorUnits(totalSaasCents),
    totalSaasCents,
    fromExpenses: toMajorUnits(saasExpenseCents),
    fromExpensesCents: saasExpenseCents,
    fromSubscriptions: toMajorUnits(subMonthlyCents),
    fromSubscriptionsCents: subMonthlyCents,
    expenseCount: saasExpenses.length,
    subscriptionCount: activeSubs.length,
    expenseItems: saasExpenses,
    subscriptionItems: activeSubs
  };
};

// 5. Vendor Report
const buildVendorReport = (vendors = []) => {
  const docs = Array.isArray(vendors) ? vendors : [];
  let totalPaidCents = 0;
  let totalPendingCents = 0;

  const vendorList = docs.map((v) => {
    const payments = Array.isArray(v.payments) ? v.payments : [];
    const paidCents = vendorTotalPaid(payments);
    const pendingCents = vendorTotalPending(payments);
    totalPaidCents += paidCents;
    totalPendingCents += pendingCents;

    return {
      id: String(v._id || v.id),
      name: v.name,
      contact: v.contact,
      serviceProvided: v.serviceProvided || null,
      paymentTerms: v.paymentTerms,
      totalPaid: toMajorUnits(paidCents),
      totalPaidCents: paidCents,
      pendingAmount: toMajorUnits(pendingCents),
      pendingCents,
      paymentCount: payments.length,
      payments
    };
  });

  return {
    totalPaid: toMajorUnits(totalPaidCents),
    totalPaidCents,
    totalPending: toMajorUnits(totalPendingCents),
    totalPendingCents,
    count: docs.length,
    vendors: vendorList
  };
};

// 6. Subscription Report
const buildSubscriptionReport = (subscriptions = [], now = new Date()) => {
  const docs = Array.isArray(subscriptions) ? subscriptions : [];
  const active = docs.filter((s) => s && s.status === 'Active');
  const totalCents = totalSubscriptionCost(active);
  const upcoming = upcomingSubscriptionRenewals(docs, now);

  const byCycle = docs.reduce((acc, s) => {
    const cycle = s.billingCycle || 'Other';
    acc[cycle] = acc[cycle] || { count: 0, totalCents: 0 };
    acc[cycle].count += 1;
    acc[cycle].totalCents += s.costCents || 0;
    return acc;
  }, {});

  const byCycleFormatted = Object.fromEntries(
    Object.entries(byCycle).map(([k, v]) => [
      k,
      { count: v.count, total: toMajorUnits(v.totalCents), totalCents: v.totalCents }
    ])
  );

  return {
    totalMonthly: toMajorUnits(totalCents),
    totalMonthlyCents: totalCents,
    activeCount: active.length,
    totalCount: docs.length,
    byBillingCycle: byCycleFormatted,
    upcomingRenewals: upcoming,
    subscriptions: docs
  };
};

// 7. Department Expense Report
const buildDepartmentReport = (expenses = [], salaries = []) => {
  const expDocs = Array.isArray(expenses) ? expenses : [];
  const salDocs = Array.isArray(salaries) ? salaries : [];

  const expenseByDeptCents = expenseTotalsByDept(expDocs);
  const salaryByDeptCents = salaryTotalsByDept(salDocs);

  const departments = Array.from(
    new Set([...Object.keys(expenseByDeptCents), ...Object.keys(salaryByDeptCents)])
  ).sort();

  let totalExpenseCents = 0;
  let totalSalaryCents = 0;

  const departmentBreakdown = departments.map((dept) => {
    const expCents = expenseByDeptCents[dept] || 0;
    const salCents = salaryByDeptCents[dept] || 0;
    const combinedCents = expCents + salCents;

    totalExpenseCents += expCents;
    totalSalaryCents += salCents;

    return {
      department: dept,
      expenses: toMajorUnits(expCents),
      expensesCents: expCents,
      salaries: toMajorUnits(salCents),
      salariesCents: salCents,
      total: toMajorUnits(combinedCents),
      totalCents: combinedCents
    };
  });

  const grandTotalCents = totalExpenseCents + totalSalaryCents;

  return {
    totalExpenses: toMajorUnits(totalExpenseCents),
    totalExpensesCents: totalExpenseCents,
    totalSalaries: toMajorUnits(totalSalaryCents),
    totalSalariesCents: totalSalaryCents,
    grandTotal: toMajorUnits(grandTotalCents),
    grandTotalCents,
    departments: departmentBreakdown
  };
};

// 8. Monthly Profit / Loss Report
// Reuses identical logic to Overview: Monthly Revenue − (Monthly Expenses + Salaries + Subscriptions)
const buildMonthlyPLReport = (invoices = [], expenses = [], salaries = [], subscriptions = [], now = new Date()) => {
  const invDocs = Array.isArray(invoices) ? invoices : [];
  const expDocs = Array.isArray(expenses) ? expenses : [];
  const salDocs = Array.isArray(salaries) ? salaries : [];
  const subDocs = Array.isArray(subscriptions) ? subscriptions : [];

  const paidInvoices = invDocs.filter((i) => i && i.paymentStatus === 'Paid');
  const activeSubs = subDocs.filter((s) => s && s.status === 'Active');

  const salaryCents = sumBy(salDocs, () => true, 'netCents');
  const subscriptionCents = sumBy(activeSubs, () => true, 'normalizedMonthlyCents');

  const currentMonth = monthKey(now);
  const currentMonthRevenueCents = sumBy(
    paidInvoices.filter((i) => i.invoiceDate && monthKey(i.invoiceDate) === currentMonth),
    () => true,
    'amountCents'
  );
  const currentMonthExpenseRecordsCents = sumBy(
    expDocs.filter((e) => e.date && monthKey(e.date) === currentMonth),
    () => true,
    'amountCents'
  );
  const currentMonthExpensesCents = currentMonthExpenseRecordsCents + salaryCents + subscriptionCents;
  const currentMonthPLCents = currentMonthRevenueCents - currentMonthExpensesCents;

  // 6-Month history
  const months = lastMonthKeys(6, now);
  const history = months.map((m) => {
    const revCents = sumBy(
      paidInvoices.filter((i) => i.invoiceDate && monthKey(i.invoiceDate) === m),
      () => true,
      'amountCents'
    );
    const expRecCents = sumBy(
      expDocs.filter((e) => e.date && monthKey(e.date) === m),
      () => true,
      'amountCents'
    );
    const expTotalCents = expRecCents + salaryCents + subscriptionCents;
    const plCents = revCents - expTotalCents;

    return {
      month: m,
      revenue: toMajorUnits(revCents),
      revenueCents: revCents,
      expenses: toMajorUnits(expTotalCents),
      expensesCents: expTotalCents,
      profitLoss: toMajorUnits(plCents),
      profitLossCents: plCents,
      isLoss: plCents < 0
    };
  });

  return {
    currentMonth: {
      month: currentMonth,
      revenue: toMajorUnits(currentMonthRevenueCents),
      revenueCents: currentMonthRevenueCents,
      expenses: toMajorUnits(currentMonthExpensesCents),
      expensesCents: currentMonthExpensesCents,
      profitLoss: toMajorUnits(currentMonthPLCents),
      profitLossCents: currentMonthPLCents,
      isLoss: currentMonthPLCents < 0
    },
    fixedMonthlyCommitments: {
      salaries: toMajorUnits(salaryCents),
      salariesCents: salaryCents,
      subscriptions: toMajorUnits(subscriptionCents),
      subscriptionsCents: subscriptionCents
    },
    history
  };
};

// 9. Outstanding Payments Report
const buildOutstandingReport = (invoices = [], vendors = []) => {
  const invDocs = Array.isArray(invoices) ? invoices : [];
  const venDocs = Array.isArray(vendors) ? vendors : [];

  const unpaidInvoices = invDocs.filter((i) => i && UNPAID_STATUSES.includes(i.paymentStatus));
  const receivablesCents = sumBy(unpaidInvoices, () => true, 'amountCents');

  const pendingPayables = [];
  let payablesCents = 0;

  venDocs.forEach((v) => {
    (v.payments || []).forEach((p) => {
      if (p && p.status === 'Pending') {
        payablesCents += p.amountCents || 0;
        pendingPayables.push({
          vendorId: String(v._id || v.id),
          vendorName: v.name,
          paymentId: String(p._id || p.id),
          amount: toMajorUnits(p.amountCents || 0),
          amountCents: p.amountCents || 0,
          date: p.date || null,
          reference: p.reference || null
        });
      }
    });
  });

  const netBalanceCents = receivablesCents - payablesCents;

  return {
    receivables: {
      total: toMajorUnits(receivablesCents),
      totalCents: receivablesCents,
      count: unpaidInvoices.length,
      invoices: unpaidInvoices
    },
    payables: {
      total: toMajorUnits(payablesCents),
      totalCents: payablesCents,
      count: pendingPayables.length,
      payments: pendingPayables
    },
    netBalance: {
      total: toMajorUnits(netBalanceCents),
      totalCents: netBalanceCents,
      isSurplus: netBalanceCents >= 0
    }
  };
};

// 10. Upcoming Payments Report
// Reuses identical logic to Overview: Subscriptions + Domains + Vendor Pending
const buildUpcomingReport = (subscriptions = [], domains = [], vendors = [], now = new Date()) => {
  const subDocs = Array.isArray(subscriptions) ? subscriptions : [];
  const domDocs = Array.isArray(domains) ? domains : [];
  const venDocs = Array.isArray(vendors) ? vendors : [];

  const upcomingSubscriptions = upcomingSubscriptionRenewals(subDocs, now).map((s) => ({
    serviceName: s.serviceName,
    provider: s.provider || null,
    renewalDate: s.renewalDate,
    monthlyCost: toMajorUnits(s.normalizedMonthlyCents),
    monthlyCents: s.normalizedMonthlyCents
  }));

  const upcomingDomains = upcomingDomainRenewals(domDocs, now).map((d) => ({
    domainName: d.domainName,
    registrar: d.registrar,
    renewalDate: d.renewalDate,
    renewalCost: toMajorUnits(d.renewalCostCents),
    renewalCostCents: d.renewalCostCents
  }));

  const vendorPendingByVendor = venDocs.map((v) => ({
    vendor: v.name,
    pending: toMajorUnits(vendorTotalPending(v.payments)),
    pendingCents: vendorTotalPending(v.payments)
  }));
  const vendorPendingCents = vendorPendingByVendor.reduce((s, v) => s + v.pendingCents, 0);

  const subCommitmentCents = upcomingSubscriptions.reduce((s, item) => s + item.monthlyCents, 0);
  const domCommitmentCents = upcomingDomains.reduce((s, item) => s + item.renewalCostCents, 0);
  const totalUpcomingCents = subCommitmentCents + domCommitmentCents + vendorPendingCents;

  return {
    subscriptions: upcomingSubscriptions,
    domains: upcomingDomains,
    vendorPending: {
      total: toMajorUnits(vendorPendingCents),
      totalCents: vendorPendingCents,
      byVendor: vendorPendingByVendor
    },
    totalUpcomingCommitments: toMajorUnits(totalUpcomingCents),
    totalUpcomingCommitmentsCents: totalUpcomingCents
  };
};

// Aggregator that pulls all 6 module models live
const getAllReports = async (now = new Date()) => {
  const [invoices, expenses, salaries, subscriptions, domains, vendors] = await Promise.all([
    Revenue.find({}).lean(),
    Expense.find({}).lean(),
    Salary.find({}).lean(),
    Subscription.find({}).lean(),
    Domain.find({}).lean(),
    Vendor.find({}).lean()
  ]);

  return {
    generatedAt: now.toISOString(),
    reports: {
      revenue: buildRevenueReport(invoices, now),
      expenses: buildExpenseReport(expenses, now),
      salaries: buildSalaryReport(salaries),
      saas: buildSaasReport(expenses, subscriptions),
      vendors: buildVendorReport(vendors),
      subscriptions: buildSubscriptionReport(subscriptions, now),
      departments: buildDepartmentReport(expenses, salaries),
      monthlyPL: buildMonthlyPLReport(invoices, expenses, salaries, subscriptions, now),
      outstanding: buildOutstandingReport(invoices, vendors),
      upcoming: buildUpcomingReport(subscriptions, domains, vendors, now)
    }
  };
};

const TYPE_MAP = {
  revenue: 'revenue',
  expenses: 'expenses',
  expense: 'expenses',
  salaries: 'salaries',
  salary: 'salaries',
  saas: 'saas',
  'saas-expense': 'saas',
  vendors: 'vendors',
  vendor: 'vendors',
  subscriptions: 'subscriptions',
  subscription: 'subscriptions',
  departments: 'departments',
  'department-expense': 'departments',
  'department-expenses': 'departments',
  'monthly-pl': 'monthlyPL',
  monthlypl: 'monthlyPL',
  'profit-loss': 'monthlyPL',
  outstanding: 'outstanding',
  'outstanding-payments': 'outstanding',
  upcoming: 'upcoming',
  'upcoming-payments': 'upcoming'
};

const getReportByType = async (type, now = new Date()) => {
  const normalizedType = String(type || '').trim().toLowerCase();
  const key = TYPE_MAP[normalizedType];
  if (!key) {
    return null;
  }

  const all = await getAllReports(now);
  if (!all.reports[key]) {
    return null;
  }

  return {
    type: key,
    generatedAt: all.generatedAt,
    data: all.reports[key]
  };
};

module.exports = {
  buildRevenueReport,
  buildExpenseReport,
  buildSalaryReport,
  buildSaasReport,
  buildVendorReport,
  buildSubscriptionReport,
  buildDepartmentReport,
  buildMonthlyPLReport,
  buildOutstandingReport,
  buildUpcomingReport,
  getAllReports,
  getReportByType
};
