// Finance Overview service — AGGREGATION ONLY. No financial records are
// created here; every figure is derived live from module collections.
// Definitions (documented in docs/api.md):
// - totalRevenue: Paid invoices only. Unpaid (Pending/Partially Paid/Overdue)
//   are reported separately as pending receivables.
// - totalExpenses: recorded expenses + salary nets + active subscription
//   monthly. Period caveat documented (salary/subscription figures are
//   monthly by definition; expenses as-recorded).
// - SaaS line: SaaS-category expenses + active subscription monthly (shown
//   with both components). Operations/Marketing: matching expense categories.
// - Monthly revenue: Paid invoices dated in the current UTC month.
//   Monthly expenses: expenses dated in current month + all salary nets +
//   active subscription monthly. monthPL = monthlyRevenue − monthlyExpenses.
// - Upcoming outflows: subscription + domain renewals (no window cutoff —
//   undefined) and vendor pending totals. No thresholds, no mutations.
// - Trends: last 6 UTC calendar months. No Redis caching: caching aggregates
//   without invalidation triggers would violate cache rules (flagged).

const Revenue = require('../revenue/revenue.model');
const Expense = require('../expenses/expense.model');
const Salary = require('../salaries/salary.model');
const Subscription = require('../subscriptions/subscription.model');
const Domain = require('../domains/domain.model');
const Vendor = require('../vendors/vendor.model');
const { totalsByCategory } = require('../expenses/expense.service');
const { upcomingRenewals: upcomingSubscriptionRenewals } = require('../subscriptions/subscription.service');
const { upcomingRenewals: upcomingDomainRenewals } = require('../domains/domain.service');
const { totalPending: vendorPending } = require('../vendors/vendor.service');

const toMajorUnits = (cents) => cents / 100;
const UNPAID_STATUSES = ['Pending', 'Partially Paid', 'Overdue'];

const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const lastMonthKeys = (count, now = new Date()) => {
  const keys = [];
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let i = count - 1; i >= 0; i -= 1) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    keys.push(`${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
};

// Monthly buckets for the last `count` UTC months: [{ month, totalCents }].
const bucketByMonth = (docs, dateKey, amountKey, count = 6, now = new Date()) => {
  const keys = lastMonthKeys(count, now);
  const totals = Object.fromEntries(keys.map((k) => [k, 0]));
  (Array.isArray(docs) ? docs : []).forEach((doc) => {
    if (!doc || !doc[dateKey]) {
      return;
    }
    const key = monthKey(doc[dateKey]);
    if (key in totals) {
      totals[key] += doc[amountKey] || 0;
    }
  });
  return keys.map((month) => ({ month, totalCents: totals[month] }));
};

const sumBy = (docs, predicate, amountKey) =>
  (Array.isArray(docs) ? docs : [])
    .filter(predicate)
    .reduce((sum, d) => sum + (d[amountKey] || 0), 0);

const getOverview = async (now = new Date()) => {
  const [invoices, expenses, salaries, subscriptions, domains, vendors] = await Promise.all([
    Revenue.find({}).lean(),
    Expense.find({}).lean(),
    Salary.find({}).lean(),
    Subscription.find({}).lean(),
    Domain.find({}).lean(),
    Vendor.find({}).lean()
  ]);

  const paidInvoices = (invoices || []).filter((i) => i && i.paymentStatus === 'Paid');
  const unpaidInvoices = (invoices || []).filter((i) => i && UNPAID_STATUSES.includes(i.paymentStatus));
  const activeSubscriptions = (subscriptions || []).filter((s) => s && s.status === 'Active');

  const revenueCents = sumBy(paidInvoices, () => true, 'amountCents');
  const expenseCents = sumBy(expenses, () => true, 'amountCents');
  const salaryCents = sumBy(salaries, () => true, 'netCents');
  const subscriptionCents = sumBy(activeSubscriptions, () => true, 'normalizedMonthlyCents');
  const totalExpensesCents = expenseCents + salaryCents + subscriptionCents;
  const netCents = revenueCents - totalExpensesCents;

  const currentMonth = monthKey(now);
  const monthlyRevenueCents = sumBy(
    paidInvoices.filter((i) => i.invoiceDate && monthKey(i.invoiceDate) === currentMonth),
    () => true,
    'amountCents'
  );
  const monthlyExpenseRecordsCents = sumBy(
    (expenses || []).filter((e) => e.date && monthKey(e.date) === currentMonth),
    () => true,
    'amountCents'
  );
  const monthlyExpensesCents = monthlyExpenseRecordsCents + salaryCents + subscriptionCents;
  const monthPLCents = monthlyRevenueCents - monthlyExpensesCents;

  const categoryCents = totalsByCategory(expenses || []);
  const saasExpenseCents = categoryCents.SaaS || 0;
  const saasCents = saasExpenseCents + subscriptionCents;

  const pendingCents = sumBy(unpaidInvoices, () => true, 'amountCents');

  const vendorPendingByVendor = (vendors || []).map((v) => ({
    vendor: v.name,
    pendingCents: vendorPending(v.payments)
  }));
  const vendorPendingCents = vendorPendingByVendor.reduce((s, v) => s + v.pendingCents, 0);

  const upcomingSubscriptions = upcomingSubscriptionRenewals(subscriptions, now).map((s) => ({
    serviceName: s.serviceName,
    renewalDate: s.renewalDate,
    monthlyCents: s.normalizedMonthlyCents
  }));
  const upcomingDomains = upcomingDomainRenewals(domains, now).map((d) => ({
    domainName: d.domainName,
    registrar: d.registrar,
    renewalDate: d.renewalDate,
    renewalCostCents: d.renewalCostCents
  }));

  const revenueTrend = bucketByMonth(paidInvoices, 'invoiceDate', 'amountCents', 6, now);
  const expenseTrend = bucketByMonth(expenses, 'date', 'amountCents', 6, now);

  const major = (cents) => toMajorUnits(cents);
  const inMajor = (map) =>
    Object.fromEntries(Object.entries(map).map(([k, v]) => [k, major(v)]));

  return {
    revenue: { total: major(revenueCents), totalCents: revenueCents },
    expenses: {
      total: major(totalExpensesCents),
      totalCents: totalExpensesCents,
      fromExpenses: major(expenseCents),
      fromExpensesCents: expenseCents,
      fromSalaries: major(salaryCents),
      fromSalariesCents: salaryCents,
      fromSubscriptions: major(subscriptionCents),
      fromSubscriptionsCents: subscriptionCents
    },
    net: { total: major(netCents), totalCents: netCents, isLoss: netCents < 0 },
    monthly: {
      month: currentMonth,
      revenue: major(monthlyRevenueCents),
      revenueCents: monthlyRevenueCents,
      expenses: major(monthlyExpensesCents),
      expensesCents: monthlyExpensesCents,
      profitLoss: major(monthPLCents),
      profitLossCents: monthPLCents,
      isLoss: monthPLCents < 0
    },
    salaries: { total: major(salaryCents), totalCents: salaryCents },
    saas: {
      total: major(saasCents),
      totalCents: saasCents,
      fromExpenses: major(saasExpenseCents),
      fromExpensesCents: saasExpenseCents,
      fromSubscriptions: major(subscriptionCents),
      fromSubscriptionsCents: subscriptionCents
    },
    operational: {
      total: major(categoryCents.Operations || 0),
      totalCents: categoryCents.Operations || 0
    },
    marketing: {
      total: major(categoryCents.Marketing || 0),
      totalCents: categoryCents.Marketing || 0
    },
    expenseByCategory: inMajor(categoryCents),
    expenseByCategoryCents: categoryCents,
    pendingPayments: {
      count: unpaidInvoices.length,
      total: major(pendingCents),
      totalCents: pendingCents
    },
    upcomingPayments: {
      subscriptions: upcomingSubscriptions,
      domains: upcomingDomains,
      vendorPending: {
        total: major(vendorPendingCents),
        totalCents: vendorPendingCents,
        byVendor: vendorPendingByVendor
      }
    },
    trends: { revenue: revenueTrend, expenses: expenseTrend },
    counts: {
      invoices: (invoices || []).length,
      expenses: (expenses || []).length,
      salaries: (salaries || []).length,
      subscriptions: (subscriptions || []).length,
      domains: (domains || []).length,
      vendors: (vendors || []).length
    }
  };
};

module.exports = {
  monthKey,
  lastMonthKeys,
  bucketByMonth,
  getOverview
};
