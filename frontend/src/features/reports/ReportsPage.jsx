import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchReports } from './reportsApi.js';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) {
    return '-';
  }
  if (num < 0) {
    return `−${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BarRow = ({ label, valueCents, maxCents }) => {
  const width = maxCents > 0 ? Math.min(100, Math.round((valueCents / maxCents) * 100)) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="bar-value">{formatCurrency(valueCents / 100)}</span>
    </div>
  );
};

const REPORT_TABS = [
  { id: 'all', label: 'All Reports Overview' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'salaries', label: 'Salaries' },
  { id: 'saas', label: 'SaaS Spend' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'departments', label: 'Department Expenses' },
  { id: 'monthlyPL', label: 'Monthly Profit / Loss' },
  { id: 'outstanding', label: 'Outstanding Payments' },
  { id: 'upcoming', label: 'Upcoming Payments' }
];

function ReportsPage() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const result = await fetchReports();
      setData(result);
      setState('success');
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="reports-page">
        <h2>Financial Reports</h2>
        <Loading message="Compiling financial reports..." />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="reports-page">
        <h2>Financial Reports</h2>
        <Error message={`Failed to load reports: ${error}`} />
        <button type="button" onClick={load} className="btn-retry">Retry</button>
      </div>
    );
  }

  const reports = data?.reports || {};
  const isCompletelyEmpty =
    !reports.revenue?.totalCount &&
    !reports.expenses?.totalCount &&
    !reports.salaries?.count &&
    !reports.subscriptions?.totalCount &&
    !reports.vendors?.count;

  if (isCompletelyEmpty) {
    return (
      <div className="reports-page">
        <h2>Financial Reports</h2>
        <p className="page-subtitle">Standardized financial reports across all modules</p>
        <Empty message="No financial data available yet across any module to generate reports." />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h2>Financial Reports</h2>
      <p className="page-subtitle">Standardized financial reporting reusing centralized service-layer calculations</p>

      {/* Report Switcher Tabs */}
      <div className="reports-tabs">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`reports-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Current Active Report */}
      <div className="report-content">
        {activeTab === 'all' && <AllReportsOverview reports={reports} onSelectTab={setActiveTab} />}
        {activeTab === 'revenue' && <RevenueReportView report={reports.revenue} />}
        {activeTab === 'expenses' && <ExpenseReportView report={reports.expenses} />}
        {activeTab === 'salaries' && <SalaryReportView report={reports.salaries} />}
        {activeTab === 'saas' && <SaasReportView report={reports.saas} />}
        {activeTab === 'vendors' && <VendorReportView report={reports.vendors} />}
        {activeTab === 'subscriptions' && <SubscriptionReportView report={reports.subscriptions} />}
        {activeTab === 'departments' && <DepartmentReportView report={reports.departments} />}
        {activeTab === 'monthlyPL' && <MonthlyPLReportView report={reports.monthlyPL} />}
        {activeTab === 'outstanding' && <OutstandingReportView report={reports.outstanding} />}
        {activeTab === 'upcoming' && <UpcomingReportView report={reports.upcoming} />}
      </div>
    </div>
  );
}

// 0. All Reports Overview
function AllReportsOverview({ reports, onSelectTab }) {
  return (
    <div className="report-section">
      <h3>Executive Financial Summary</h3>
      <p className="section-note">Overview across all 10 required financial report categories</p>

      <div className="summary-cards">
        <div className="summary-card" onClick={() => onSelectTab('revenue')} style={{ cursor: 'pointer' }}>
          <span>1. Paid Revenue</span>
          <strong>{formatCurrency(reports.revenue?.totalRevenue)}</strong>
          <small>{reports.revenue?.paidCount || 0} Paid Invoices</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('expenses')} style={{ cursor: 'pointer' }}>
          <span>2. Total Expenses</span>
          <strong>{formatCurrency(reports.expenses?.total)}</strong>
          <small>{reports.expenses?.totalCount || 0} Recorded</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('salaries')} style={{ cursor: 'pointer' }}>
          <span>3. Monthly Salaries</span>
          <strong>{formatCurrency(reports.salaries?.totalMonthlyCost)}</strong>
          <small>{reports.salaries?.count || 0} Employees</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('saas')} style={{ cursor: 'pointer' }}>
          <span>4. SaaS Spend</span>
          <strong>{formatCurrency(reports.saas?.totalSaas)}</strong>
          <small>Expenses + Subscriptions</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('vendors')} style={{ cursor: 'pointer' }}>
          <span>5. Vendor Paid</span>
          <strong>{formatCurrency(reports.vendors?.totalPaid)}</strong>
          <small>{reports.vendors?.count || 0} Vendors</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('subscriptions')} style={{ cursor: 'pointer' }}>
          <span>6. Subscriptions Monthly</span>
          <strong>{formatCurrency(reports.subscriptions?.totalMonthly)}</strong>
          <small>{reports.subscriptions?.activeCount || 0} Active</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('departments')} style={{ cursor: 'pointer' }}>
          <span>7. Department Spend</span>
          <strong>{formatCurrency(reports.departments?.grandTotal)}</strong>
          <small>{reports.departments?.departments?.length || 0} Depts</small>
        </div>

        <div
          className={`summary-card ${reports.monthlyPL?.currentMonth?.isLoss ? 'card-loss' : 'card-profit'}`}
          onClick={() => onSelectTab('monthlyPL')}
          style={{ cursor: 'pointer' }}
        >
          <span>8. Month P/L ({reports.monthlyPL?.currentMonth?.month || 'Current'})</span>
          <strong className={reports.monthlyPL?.currentMonth?.isLoss ? 'text-loss' : 'text-profit'}>
            {formatCurrency(reports.monthlyPL?.currentMonth?.profitLoss)} {reports.monthlyPL?.currentMonth?.isLoss ? '(Loss)' : '(Profit)'}
          </strong>
          <small>Revenue − Total Expenses</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('outstanding')} style={{ cursor: 'pointer' }}>
          <span>9. Outstanding Receivables</span>
          <strong>{formatCurrency(reports.outstanding?.receivables?.total)}</strong>
          <small>{reports.outstanding?.receivables?.count || 0} Unpaid Invoices</small>
        </div>

        <div className="summary-card" onClick={() => onSelectTab('upcoming')} style={{ cursor: 'pointer' }}>
          <span>10. Upcoming Commitments</span>
          <strong>{formatCurrency(reports.upcoming?.totalUpcomingCommitments)}</strong>
          <small>Renewals + Vendor Pending</small>
        </div>
      </div>
    </div>
  );
}

// 1. Revenue Report
function RevenueReportView({ report }) {
  if (!report) return <Empty message="No revenue report data available" />;
  const maxTrend = Math.max(...(report.trend || []).map((t) => t.totalCents), 0);

  return (
    <div className="report-section">
      <h3>Revenue Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Paid Revenue</span>
          <strong>{formatCurrency(report.totalRevenue)}</strong>
        </div>
        <div className="summary-card">
          <span>Pending Receivables</span>
          <strong>{formatCurrency(report.pendingRevenue)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Invoices</span>
          <strong>{report.totalCount}</strong>
        </div>
        <div className="summary-card">
          <span>Paid Invoices</span>
          <strong>{report.paidCount}</strong>
        </div>
      </div>

      <h4>Status Breakdown</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.byStatus || {}).map(([status, item]) => (
            <tr key={status}>
              <td><span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span></td>
              <td>{item.count}</td>
              <td>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {report.trend && report.trend.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>6-Month Paid Revenue Trend</h4>
          {report.trend.map((t) => (
            <BarRow key={t.month} label={t.month} valueCents={t.totalCents} maxCents={maxTrend} />
          ))}
        </div>
      )}
    </div>
  );
}

// 2. Expense Report
function ExpenseReportView({ report }) {
  if (!report) return <Empty message="No expense report data available" />;
  const maxTrend = Math.max(...(report.trend || []).map((t) => t.totalCents), 0);
  const catEntries = Object.entries(report.byCategoryCents || {});
  const maxCategory = Math.max(...catEntries.map(([, v]) => v), 0);

  return (
    <div className="report-section">
      <h3>Expense Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Recorded Expenses</span>
          <strong>{formatCurrency(report.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Expense Records</span>
          <strong>{report.totalCount}</strong>
        </div>
      </div>

      <h4>Expenses by Category</h4>
      {catEntries.length === 0 ? (
        <Empty message="No categorized expenses recorded" />
      ) : (
        catEntries.map(([category, cents]) => (
          <BarRow key={category} label={category} valueCents={cents} maxCents={maxCategory} />
        ))
      )}

      <h4 style={{ marginTop: '1.5rem' }}>Expenses by Department</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.byDepartment || {}).map(([dept, amount]) => (
            <tr key={dept}>
              <td>{dept}</td>
              <td>{formatCurrency(amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {report.trend && report.trend.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>6-Month Expense Trend</h4>
          {report.trend.map((t) => (
            <BarRow key={t.month} label={t.month} valueCents={t.totalCents} maxCents={maxTrend} />
          ))}
        </div>
      )}
    </div>
  );
}

// 3. Salary Report
function SalaryReportView({ report }) {
  if (!report) return <Empty message="No salary report data available" />;

  return (
    <div className="report-section">
      <h3>Salary Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Monthly Cost (Net)</span>
          <strong>{formatCurrency(report.totalMonthlyCost)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Gross Payroll</span>
          <strong>{formatCurrency(report.totalGross)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Deductions</span>
          <strong>{formatCurrency(report.totalDeductions)}</strong>
        </div>
        <div className="summary-card">
          <span>Active Employees</span>
          <strong>{report.count}</strong>
        </div>
      </div>

      <h4>Department Payroll (Monthly Net)</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Monthly Net Cost</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.byDepartment || {}).map(([dept, amount]) => (
            <tr key={dept}>
              <td>{dept}</td>
              <td>{formatCurrency(amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: '1.5rem' }}>Employee Payroll Distribution</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Monthly Net Cost</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.byEmployee || {}).map(([emp, amount]) => (
            <tr key={emp}>
              <td>{emp}</td>
              <td>{formatCurrency(amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 4. SaaS Expense Report
function SaasReportView({ report }) {
  if (!report) return <Empty message="No SaaS report data available" />;

  return (
    <div className="report-section">
      <h3>SaaS Expense Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Monthly SaaS Spend</span>
          <strong>{formatCurrency(report.totalSaas)}</strong>
        </div>
        <div className="summary-card">
          <span>From Recorded Expenses (SaaS)</span>
          <strong>{formatCurrency(report.fromExpenses)}</strong>
          <small>{report.expenseCount} records</small>
        </div>
        <div className="summary-card">
          <span>From Active Subscriptions</span>
          <strong>{formatCurrency(report.fromSubscriptions)}</strong>
          <small>{report.subscriptionCount} subscriptions</small>
        </div>
      </div>

      <h4>Active Subscriptions Monthly Breakdown</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Provider</th>
            <th>Billing Cycle</th>
            <th>Normalized Monthly</th>
          </tr>
        </thead>
        <tbody>
          {(report.subscriptionItems || []).map((s) => (
            <tr key={s._id || s.id || s.serviceName}>
              <td>{s.serviceName}</td>
              <td>{s.provider || '-'}</td>
              <td>{s.billingCycle}</td>
              <td>{formatCurrency((s.normalizedMonthlyCents || 0) / 100)}</td>
            </tr>
          ))}
          {(!report.subscriptionItems || report.subscriptionItems.length === 0) && (
            <tr><td colSpan={4}>No active subscriptions recorded</td></tr>
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: '1.5rem' }}>Recorded SaaS Expenses</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Vendor</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(report.expenseItems || []).map((e) => (
            <tr key={e._id || e.id || e.description}>
              <td>{formatDate(e.date)}</td>
              <td>{e.description}</td>
              <td>{e.vendor || '-'}</td>
              <td>{formatCurrency((e.amountCents || 0) / 100)}</td>
            </tr>
          ))}
          {(!report.expenseItems || report.expenseItems.length === 0) && (
            <tr><td colSpan={4}>No SaaS category expense records</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 5. Vendor Report
function VendorReportView({ report }) {
  if (!report) return <Empty message="No vendor report data available" />;

  return (
    <div className="report-section">
      <h3>Vendor Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Paid to Vendors</span>
          <strong>{formatCurrency(report.totalPaid)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Pending Payments</span>
          <strong>{formatCurrency(report.totalPending)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Vendors</span>
          <strong>{report.count}</strong>
        </div>
      </div>

      <h4>Vendor Accounts & Payment Status</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Payment Terms</th>
            <th>Total Paid</th>
            <th>Pending</th>
            <th>Payments</th>
          </tr>
        </thead>
        <tbody>
          {(report.vendors || []).map((v) => (
            <tr key={v.id || v.name}>
              <td><strong>{v.name}</strong></td>
              <td>{v.contact}</td>
              <td>{v.serviceProvided || '-'}</td>
              <td>{v.paymentTerms}</td>
              <td>{formatCurrency(v.totalPaid)}</td>
              <td>{formatCurrency(v.pendingAmount)}</td>
              <td>{v.paymentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 6. Subscription Report
function SubscriptionReportView({ report }) {
  if (!report) return <Empty message="No subscription report data available" />;

  return (
    <div className="report-section">
      <h3>Subscription Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Active Monthly Spend</span>
          <strong>{formatCurrency(report.totalMonthly)}</strong>
        </div>
        <div className="summary-card">
          <span>Active Subscriptions</span>
          <strong>{report.activeCount}</strong>
        </div>
        <div className="summary-card">
          <span>Total Subscriptions</span>
          <strong>{report.totalCount}</strong>
        </div>
      </div>

      <h4>Billing Cycle Breakdown</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Billing Cycle</th>
            <th>Count</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(report.byBillingCycle || {}).map(([cycle, item]) => (
            <tr key={cycle}>
              <td>{cycle}</td>
              <td>{item.count}</td>
              <td>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: '1.5rem' }}>Upcoming Renewals</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Renewal Date</th>
            <th>Monthly Cost</th>
          </tr>
        </thead>
        <tbody>
          {(report.upcomingRenewals || []).map((s) => (
            <tr key={s.id || s._id || s.serviceName}>
              <td>{s.serviceName}</td>
              <td>{formatDate(s.renewalDate)}</td>
              <td>{formatCurrency((s.normalizedMonthlyCents || 0) / 100)}</td>
            </tr>
          ))}
          {(!report.upcomingRenewals || report.upcomingRenewals.length === 0) && (
            <tr><td colSpan={3}>No upcoming renewals</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 7. Department Expense Report
function DepartmentReportView({ report }) {
  if (!report) return <Empty message="No department report data available" />;

  return (
    <div className="report-section">
      <h3>Department Expense Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Grand Total Spending</span>
          <strong>{formatCurrency(report.grandTotal)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Recorded Expenses</span>
          <strong>{formatCurrency(report.totalExpenses)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Salary Payroll</span>
          <strong>{formatCurrency(report.totalSalaries)}</strong>
        </div>
      </div>

      <h4>Department Spend Breakdown</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Recorded Expenses</th>
            <th>Salary Payroll</th>
            <th>Total Department Spend</th>
          </tr>
        </thead>
        <tbody>
          {(report.departments || []).map((d) => (
            <tr key={d.department}>
              <td><strong>{d.department}</strong></td>
              <td>{formatCurrency(d.expenses)}</td>
              <td>{formatCurrency(d.salaries)}</td>
              <td><strong>{formatCurrency(d.total)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 8. Monthly Profit / Loss Report
function MonthlyPLReportView({ report }) {
  if (!report) return <Empty message="No profit/loss report data available" />;
  const curr = report.currentMonth || {};
  const isLoss = curr.isLoss;

  return (
    <div className="report-section">
      <h3>Monthly Profit / Loss Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Month</span>
          <strong>{curr.month || '-'}</strong>
        </div>
        <div className="summary-card">
          <span>Monthly Revenue</span>
          <strong>{formatCurrency(curr.revenue)}</strong>
        </div>
        <div className="summary-card">
          <span>Monthly Expenses</span>
          <strong>{formatCurrency(curr.expenses)}</strong>
        </div>
        <div className={`summary-card ${isLoss ? 'card-loss' : 'card-profit'}`}>
          <span>Net Profit / Loss</span>
          <strong className={isLoss ? 'text-loss' : 'text-profit'}>
            {formatCurrency(curr.profitLoss)} {isLoss ? '(Loss)' : '(Profit)'}
          </strong>
        </div>
      </div>

      <div style={{ margin: '1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
        Fixed commitments included in monthly expenses: Salaries ({formatCurrency(report.fixedMonthlyCommitments?.salaries)}), Subscriptions ({formatCurrency(report.fixedMonthlyCommitments?.subscriptions)})
      </div>

      <h4>6-Month Historical Profit / Loss</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Expenses</th>
            <th>Profit / Loss</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {(report.history || []).map((h) => (
            <tr key={h.month}>
              <td><strong>{h.month}</strong></td>
              <td>{formatCurrency(h.revenue)}</td>
              <td>{formatCurrency(h.expenses)}</td>
              <td className={h.isLoss ? 'text-loss' : 'text-profit'}>
                <strong>{formatCurrency(h.profitLoss)}</strong>
              </td>
              <td>
                <span className={`status-badge ${h.isLoss ? 'status-overdue' : 'status-paid'}`}>
                  {h.isLoss ? 'Loss' : 'Profit'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 9. Outstanding Payments Report
function OutstandingReportView({ report }) {
  if (!report) return <Empty message="No outstanding payments report data available" />;
  const rec = report.receivables || {};
  const pay = report.payables || {};
  const net = report.netBalance || {};

  return (
    <div className="report-section">
      <h3>Outstanding Payments Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Outstanding Receivables (Invoices)</span>
          <strong>{formatCurrency(rec.total)}</strong>
          <small>{rec.count} unpaid invoices</small>
        </div>
        <div className="summary-card">
          <span>Outstanding Payables (Vendors)</span>
          <strong>{formatCurrency(pay.total)}</strong>
          <small>{pay.count} pending payments</small>
        </div>
        <div className={`summary-card ${net.isSurplus ? 'card-profit' : 'card-loss'}`}>
          <span>Net Balance</span>
          <strong className={net.isSurplus ? 'text-profit' : 'text-loss'}>
            {formatCurrency(net.total)} {net.isSurplus ? '(Surplus)' : '(Deficit)'}
          </strong>
        </div>
      </div>

      <h4>Unpaid Invoices (Receivables)</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(rec.invoices || []).map((i) => (
            <tr key={i._id || i.id || i.invoiceNumber}>
              <td><strong>{i.invoiceNumber}</strong></td>
              <td>{i.customer}</td>
              <td>{formatDate(i.invoiceDate)}</td>
              <td>{formatDate(i.dueDate)}</td>
              <td>
                <span className={`status-badge status-${(i.paymentStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {i.paymentStatus}
                </span>
              </td>
              <td>{formatCurrency((i.amountCents || 0) / 100)}</td>
            </tr>
          ))}
          {(!rec.invoices || rec.invoices.length === 0) && (
            <tr><td colSpan={6}>No unpaid invoices</td></tr>
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: '1.5rem' }}>Pending Vendor Payables</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Reference</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(pay.payments || []).map((p) => (
            <tr key={p.paymentId || p.reference || p.vendorName}>
              <td><strong>{p.vendorName}</strong></td>
              <td>{p.reference || '-'}</td>
              <td>{formatDate(p.date)}</td>
              <td>{formatCurrency(p.amount)}</td>
            </tr>
          ))}
          {(!pay.payments || pay.payments.length === 0) && (
            <tr><td colSpan={4}>No pending vendor payments</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 10. Upcoming Payments Report
function UpcomingReportView({ report }) {
  if (!report) return <Empty message="No upcoming payments report data available" />;

  return (
    <div className="report-section">
      <h3>Upcoming Payments Report</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Upcoming Commitments</span>
          <strong>{formatCurrency(report.totalUpcomingCommitments)}</strong>
        </div>
        <div className="summary-card">
          <span>Vendor Pending Total</span>
          <strong>{formatCurrency(report.vendorPending?.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Subscription Renewals</span>
          <strong>{report.subscriptions?.length || 0}</strong>
        </div>
        <div className="summary-card">
          <span>Domain Renewals</span>
          <strong>{report.domains?.length || 0}</strong>
        </div>
      </div>

      <h4>Upcoming Subscription Renewals</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Renewal Date</th>
            <th>Monthly Cost</th>
          </tr>
        </thead>
        <tbody>
          {(report.subscriptions || []).map((s) => (
            <tr key={s.serviceName + s.renewalDate}>
              <td><strong>{s.serviceName}</strong></td>
              <td>{formatDate(s.renewalDate)}</td>
              <td>{formatCurrency(s.monthlyCost)}</td>
            </tr>
          ))}
          {(!report.subscriptions || report.subscriptions.length === 0) && (
            <tr><td colSpan={3}>No upcoming subscription renewals</td></tr>
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: '1.5rem' }}>Upcoming Domain Renewals</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Registrar</th>
            <th>Renewal Date</th>
            <th>Renewal Cost</th>
          </tr>
        </thead>
        <tbody>
          {(report.domains || []).map((d) => (
            <tr key={d.domainName}>
              <td><strong>{d.domainName}</strong></td>
              <td>{d.registrar}</td>
              <td>{formatDate(d.renewalDate)}</td>
              <td>{formatCurrency(d.renewalCost)}</td>
            </tr>
          ))}
          {(!report.domains || report.domains.length === 0) && (
            <tr><td colSpan={4}>No upcoming domain renewals</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportsPage;
