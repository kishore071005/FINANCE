const {
  buildRevenueReport,
  buildExpenseReport,
  buildSalaryReport,
  buildSaasReport,
  buildVendorReport,
  buildSubscriptionReport,
  buildDepartmentReport,
  buildMonthlyPLReport,
  buildOutstandingReport,
  buildUpcomingReport
} = require('../../backend/src/modules/reports/reports.service');

describe('Reports Service — Unit Tests for 10 Required Reports', () => {
  const fixedNow = new Date('2026-03-15T00:00:00Z');

  // 1. Revenue Report
  describe('Revenue Report', () => {
    it('calculates paid revenue, pending receivables, and status breakdowns accurately', () => {
      const invoices = [
        { invoiceDate: '2026-03-01', amountCents: 500000, taxCents: 50000, paymentStatus: 'Paid' },
        { invoiceDate: '2026-03-05', amountCents: 200000, taxCents: 20000, paymentStatus: 'Pending' },
        { invoiceDate: '2026-03-10', amountCents: 150000, taxCents: 15000, paymentStatus: 'Overdue' }
      ];

      const report = buildRevenueReport(invoices, fixedNow);
      expect(report.totalRevenue).toBe(5000);
      expect(report.totalRevenueCents).toBe(500000);
      expect(report.pendingRevenue).toBe(3500); // 2000 + 1500
      expect(report.pendingRevenueCents).toBe(350000);
      expect(report.totalCount).toBe(3);
      expect(report.paidCount).toBe(1);
      expect(report.unpaidCount).toBe(2);
      expect(report.byStatus.Paid.count).toBe(1);
      expect(report.byStatus.Pending.count).toBe(1);
      expect(report.byStatus.Overdue.count).toBe(1);
    });

    it('handles empty invoice records gracefully (no crash, zero totals)', () => {
      const report = buildRevenueReport([], fixedNow);
      expect(report.totalRevenue).toBe(0);
      expect(report.pendingRevenue).toBe(0);
      expect(report.totalCount).toBe(0);
      expect(report.paidCount).toBe(0);
    });
  });

  // 2. Expense Report
  describe('Expense Report', () => {
    it('aggregates expenses by category and department correctly', () => {
      const expenses = [
        { date: '2026-03-01', amountCents: 120000, category: 'SaaS', department: 'Engineering' },
        { date: '2026-03-04', amountCents: 80000, category: 'Marketing', department: 'Growth' },
        { date: '2026-03-10', amountCents: 50000, category: 'SaaS', department: 'Engineering' }
      ];

      const report = buildExpenseReport(expenses, fixedNow);
      expect(report.total).toBe(2500);
      expect(report.totalCents).toBe(250000);
      expect(report.byCategory.SaaS).toBe(1700);
      expect(report.byCategory.Marketing).toBe(800);
      expect(report.byDepartment.Engineering).toBe(1700);
      expect(report.byDepartment.Growth).toBe(800);
      expect(report.totalCount).toBe(3);
    });

    it('handles empty expense list safely', () => {
      const report = buildExpenseReport([], fixedNow);
      expect(report.total).toBe(0);
      expect(report.totalCents).toBe(0);
      expect(report.totalCount).toBe(0);
    });
  });

  // 3. Salary Report
  describe('Salary Report', () => {
    it('computes gross, deductions, net monthly costs, and departmental sums', () => {
      const salaries = [
        { employee: 'Alice', department: 'Engineering', grossCents: 800000, deductionsCents: 100000, netCents: 700000 },
        { employee: 'Bob', department: 'Sales', grossCents: 500000, deductionsCents: 50000, netCents: 450000 }
      ];

      const report = buildSalaryReport(salaries);
      expect(report.totalMonthlyCost).toBe(11500); // 7000 + 4500
      expect(report.totalGross).toBe(13000);
      expect(report.totalDeductions).toBe(1500);
      expect(report.byDepartment.Engineering).toBe(7000);
      expect(report.byDepartment.Sales).toBe(4500);
      expect(report.byEmployee.Alice).toBe(7000);
      expect(report.byEmployee.Bob).toBe(4500);
      expect(report.count).toBe(2);
    });

    it('handles empty salaries array', () => {
      const report = buildSalaryReport([]);
      expect(report.totalMonthlyCost).toBe(0);
      expect(report.count).toBe(0);
    });
  });

  // 4. SaaS Expense Report
  describe('SaaS Expense Report', () => {
    it('reuses identical calculation to Overview: SaaS Expenses + Active Subscriptions', () => {
      const expenses = [
        { amountCents: 40000, category: 'SaaS', description: 'GitHub Enterprise' },
        { amountCents: 60000, category: 'Marketing', description: 'Ads' }
      ];
      const subscriptions = [
        { serviceName: 'AWS', status: 'Active', normalizedMonthlyCents: 150000 },
        { serviceName: 'Old Tool', status: 'Cancelled', normalizedMonthlyCents: 20000 }
      ];

      const report = buildSaasReport(expenses, subscriptions);
      expect(report.fromExpenses).toBe(400);
      expect(report.fromSubscriptions).toBe(1500);
      expect(report.totalSaas).toBe(1900); // 400 + 1500
      expect(report.totalSaasCents).toBe(190000);
      expect(report.expenseCount).toBe(1);
      expect(report.subscriptionCount).toBe(1);
    });
  });

  // 5. Vendor Report
  describe('Vendor Report', () => {
    it('aggregates total paid and pending payments across vendors', () => {
      const vendors = [
        {
          name: 'Acme Cloud',
          contact: 'acme@cloud.com',
          payments: [
            { amountCents: 300000, status: 'Paid' },
            { amountCents: 100000, status: 'Pending' }
          ]
        },
        {
          name: 'Legal Corp',
          contact: 'legal@corp.com',
          payments: [
            { amountCents: 200000, status: 'Paid' }
          ]
        }
      ];

      const report = buildVendorReport(vendors);
      expect(report.totalPaid).toBe(5000); // 3000 + 2000
      expect(report.totalPending).toBe(1000);
      expect(report.count).toBe(2);
      expect(report.vendors[0].totalPaid).toBe(3000);
      expect(report.vendors[0].pendingAmount).toBe(1000);
    });
  });

  // 6. Subscription Report
  describe('Subscription Report', () => {
    it('reports active subscription monthly totals and upcoming renewals', () => {
      const subscriptions = [
        { serviceName: 'Slack', billingCycle: 'Monthly', costCents: 50000, normalizedMonthlyCents: 50000, status: 'Active', renewalDate: '2026-03-25' },
        { serviceName: 'Figma', billingCycle: 'Annual', costCents: 120000, normalizedMonthlyCents: 10000, status: 'Active', renewalDate: '2026-04-01' },
        { serviceName: 'Zoom', billingCycle: 'Monthly', costCents: 30000, normalizedMonthlyCents: 30000, status: 'Cancelled', renewalDate: '2026-02-01' }
      ];

      const report = buildSubscriptionReport(subscriptions, fixedNow);
      expect(report.totalMonthly).toBe(600); // 500 + 100
      expect(report.activeCount).toBe(2);
      expect(report.totalCount).toBe(3);
      expect(report.upcomingRenewals).toHaveLength(2);
      expect(report.byBillingCycle.Monthly.count).toBe(2);
      expect(report.byBillingCycle.Annual.count).toBe(1);
    });
  });

  // 7. Department Expense Report
  describe('Department Expense Report', () => {
    it('combines recorded expenses and salary costs per department', () => {
      const expenses = [
        { amountCents: 100000, department: 'Engineering' },
        { amountCents: 50000, department: 'Marketing' }
      ];
      const salaries = [
        { department: 'Engineering', netCents: 400000 },
        { department: 'Design', netCents: 200000 }
      ];

      const report = buildDepartmentReport(expenses, salaries);
      expect(report.departments).toHaveLength(3); // Design, Engineering, Marketing

      const eng = report.departments.find((d) => d.department === 'Engineering');
      expect(eng.expenses).toBe(1000);
      expect(eng.salaries).toBe(4000);
      expect(eng.total).toBe(5000);

      const mkt = report.departments.find((d) => d.department === 'Marketing');
      expect(mkt.expenses).toBe(500);
      expect(mkt.salaries).toBe(0);
      expect(mkt.total).toBe(500);

      expect(report.totalExpenses).toBe(1500);
      expect(report.totalSalaries).toBe(6000);
      expect(report.grandTotal).toBe(7500);
    });
  });

  // 8. Monthly Profit / Loss Report
  describe('Monthly Profit / Loss Report', () => {
    it('matches Overview calculation: Monthly Rev − (Monthly Exp + Salaries + Subs)', () => {
      const invoices = [
        { invoiceDate: '2026-03-05', amountCents: 1000000, paymentStatus: 'Paid' },
        { invoiceDate: '2026-02-10', amountCents: 800000, paymentStatus: 'Paid' }
      ];
      const expenses = [
        { date: '2026-03-02', amountCents: 200000 },
        { date: '2026-02-15', amountCents: 150000 }
      ];
      const salaries = [
        { netCents: 400000 }
      ];
      const subscriptions = [
        { status: 'Active', normalizedMonthlyCents: 100000 }
      ];

      const report = buildMonthlyPLReport(invoices, expenses, salaries, subscriptions, fixedNow);

      // March calculation:
      // Rev = 10,000 (1,000,000 cents)
      // Exp = 2,000 (exp records) + 4,000 (salaries) + 1,000 (subscriptions) = 7,000 (700,000 cents)
      // P/L = 3,000 (300,000 cents), isLoss: false
      expect(report.currentMonth.revenue).toBe(10000);
      expect(report.currentMonth.expenses).toBe(7000);
      expect(report.currentMonth.profitLoss).toBe(3000);
      expect(report.currentMonth.isLoss).toBe(false);

      expect(report.history).toHaveLength(6);
    });

    it('correctly marks a loss when monthly expenses exceed revenue', () => {
      const invoices = [
        { invoiceDate: '2026-03-05', amountCents: 300000, paymentStatus: 'Paid' }
      ];
      const expenses = [
        { date: '2026-03-02', amountCents: 500000 }
      ];
      const salaries = [{ netCents: 200000 }];
      const subscriptions = [];

      const report = buildMonthlyPLReport(invoices, expenses, salaries, subscriptions, fixedNow);
      expect(report.currentMonth.revenue).toBe(3000);
      expect(report.currentMonth.expenses).toBe(7000);
      expect(report.currentMonth.profitLoss).toBe(-4000);
      expect(report.currentMonth.isLoss).toBe(true);
    });
  });

  // 9. Outstanding Payments Report
  describe('Outstanding Payments Report', () => {
    it('tracks unpaid receivables and pending vendor payables with net balance', () => {
      const invoices = [
        { invoiceNumber: 'INV-1', amountCents: 500000, paymentStatus: 'Pending' },
        { invoiceNumber: 'INV-2', amountCents: 200000, paymentStatus: 'Overdue' },
        { invoiceNumber: 'INV-3', amountCents: 300000, paymentStatus: 'Paid' }
      ];
      const vendors = [
        {
          name: 'Supplier A',
          payments: [
            { amountCents: 400000, status: 'Pending' },
            { amountCents: 100000, status: 'Paid' }
          ]
        }
      ];

      const report = buildOutstandingReport(invoices, vendors);
      expect(report.receivables.total).toBe(7000); // 5000 + 2000
      expect(report.receivables.count).toBe(2);
      expect(report.payables.total).toBe(4000);
      expect(report.payables.count).toBe(1);
      expect(report.netBalance.total).toBe(3000); // 7000 - 4000
      expect(report.netBalance.isSurplus).toBe(true);
    });
  });

  // 10. Upcoming Payments Report
  describe('Upcoming Payments Report', () => {
    it('combines subscriptions, domains, and vendor pending into upcoming commitments', () => {
      const subscriptions = [
        { serviceName: 'GitHub', status: 'Active', renewalDate: '2026-03-20', normalizedMonthlyCents: 5000 }
      ];
      const domains = [
        { domainName: 'mysite.com', renewalDate: '2026-03-25', renewalCostCents: 2000 }
      ];
      const vendors = [
        {
          name: 'Hosting Provider',
          payments: [{ amountCents: 10000, status: 'Pending' }]
        }
      ];

      const report = buildUpcomingReport(subscriptions, domains, vendors, fixedNow);
      expect(report.subscriptions).toHaveLength(1);
      expect(report.domains).toHaveLength(1);
      expect(report.vendorPending.total).toBe(100);
      expect(report.totalUpcomingCommitments).toBe(170); // 50 + 20 + 100
      expect(report.totalUpcomingCommitmentsCents).toBe(17000);
    });
  });
});
