import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchOverview } from './overviewApi.js';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

// Simple CSS bar visualization (no charting library per harness constraints).
const BarRow = ({ label, valueCents, maxCents }) => {
  const width = maxCents > 0 ? Math.round((valueCents / maxCents) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="bar-value">{valueCents / 100}</span>
    </div>
  );
};

const formatCurrency = (value) => {
  const num = Number(value);
  if (num < 0) {
    return `−${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const isEmptyDashboard = (data) =>
  data &&
  data.revenue.totalCents === 0 &&
  data.expenses.totalCents === 0 &&
  data.counts.invoices === 0 &&
  data.counts.expenses === 0 &&
  data.counts.salaries === 0 &&
  data.counts.subscriptions === 0 &&
  data.counts.domains === 0 &&
  data.counts.vendors === 0;

function OverviewPage() {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const overview = await fetchOverview();
      setData(overview);
      setState('success');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="overview-page">
        <h2>Finance Overview</h2>
        <Loading message="Loading dashboard..." />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="overview-page">
        <h2>Finance Overview</h2>
        <Error message={`Failed to load dashboard: ${error}`} />
        <button type="button" onClick={load}>Retry</button>
      </div>
    );
  }

  const trendMax = Math.max(
    ...data.trends.revenue.map((t) => t.totalCents),
    ...data.trends.expenses.map((t) => t.totalCents),
    0
  );
  const categoryEntries = Object.entries(data.expenseByCategoryCents);
  const categoryMax = Math.max(...categoryEntries.map(([, v]) => v), 0);

  return (
    <div className="overview-page">
      <h2>Finance Overview</h2>
      <p className="page-subtitle">Money in, money out, and what is coming up</p>

      {isEmptyDashboard(data) && (
        <Empty message="No financial activity yet. Add invoices, expenses, salaries, or subscriptions to populate this dashboard." />
      )}

      <div className="summary-cards">
        <div className="summary-card">
          <span>Total Revenue</span>
          <strong>{formatCurrency(data.revenue.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Expenses</span>
          <strong>{formatCurrency(data.expenses.total)}</strong>
        </div>
        <div className={`summary-card ${data.net.isLoss ? 'card-loss' : 'card-profit'}`}>
          <span>Net Income {data.net.isLoss ? '(Loss)' : '(Profit)'}</span>
          <strong className={data.net.isLoss ? 'text-loss' : 'text-profit'}>{formatCurrency(data.net.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Monthly Revenue ({data.monthly.month})</span>
          <strong>{formatCurrency(data.monthly.revenue)}</strong>
        </div>
        <div className="summary-card">
          <span>Monthly Expenses</span>
          <strong>{formatCurrency(data.monthly.expenses)}</strong>
        </div>
        <div className={`summary-card ${data.monthly.isLoss ? 'card-loss' : 'card-profit'}`}>
          <span>Month {data.monthly.isLoss ? 'Loss' : 'Profit'}</span>
          <strong className={data.monthly.isLoss ? 'text-loss' : 'text-profit'}>{formatCurrency(data.monthly.profitLoss)}</strong>
        </div>
        <div className="summary-card">
          <span>Salary Expenses</span>
          <strong>{formatCurrency(data.salaries.total)}</strong>
        </div>
        <div className="summary-card">
          <span>SaaS Expenses</span>
          <strong>{formatCurrency(data.saas.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Operational Expenses</span>
          <strong>{formatCurrency(data.operational.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Marketing Expenses</span>
          <strong>{formatCurrency(data.marketing.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Pending Payments ({data.pendingPayments.count})</span>
          <strong>{formatCurrency(data.pendingPayments.total)}</strong>
        </div>
        <div className="summary-card">
          <span>Upcoming Payments</span>
          <strong>{data.upcomingPayments.subscriptions.length + data.upcomingPayments.domains.length} renewals</strong>
        </div>
      </div>

      <div className="detail-panel">
        <h3>Revenue Trend (last 6 months)</h3>
        {data.trends.revenue.map((t) => (
          <BarRow key={t.month} label={t.month} valueCents={t.totalCents} maxCents={trendMax} />
        ))}
      </div>

      <div className="detail-panel">
        <h3>Expense Trend (last 6 months)</h3>
        {data.trends.expenses.map((t) => (
          <BarRow key={t.month} label={t.month} valueCents={t.totalCents} maxCents={trendMax} />
        ))}
      </div>

      <div className="detail-panel">
        <h3>Expense by Category</h3>
        {categoryEntries.length === 0 && <p>No expenses recorded.</p>}
        {categoryEntries.map(([cat, cents]) => (
          <BarRow key={cat} label={cat} valueCents={cents} maxCents={categoryMax} />
        ))}
      </div>

      <div className="detail-panel">
        <h3>Upcoming Payments</h3>
        <h4>Subscription Renewals</h4>
        {data.upcomingPayments.subscriptions.length === 0 && <p>None.</p>}
        {data.upcomingPayments.subscriptions.map((s) => (
          <p key={`${s.serviceName}-${s.renewalDate}`}>{s.serviceName} — {formatDate(s.renewalDate)} ({s.monthlyCents / 100}/mo)</p>
        ))}
        <h4>Domain Renewals</h4>
        {data.upcomingPayments.domains.length === 0 && <p>None.</p>}
        {data.upcomingPayments.domains.map((d) => (
          <p key={`${d.domainName}-${d.renewalDate}`}>{d.domainName} — {formatDate(d.renewalDate)}</p>
        ))}
        <h4>Vendor Pending ({data.upcomingPayments.vendorPending.total})</h4>
        {data.upcomingPayments.vendorPending.byVendor.filter((v) => v.pendingCents > 0).map((v) => (
          <p key={v.vendor}>{v.vendor}: {v.pendingCents / 100}</p>
        ))}
      </div>
    </div>
  );
}

export default OverviewPage;
