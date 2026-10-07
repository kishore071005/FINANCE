import { useCallback, useEffect, useState } from 'react';
import Loading from '../components/common/Loading.jsx';
import Empty from '../components/common/Empty.jsx';
import Error from '../components/common/Error.jsx';
import { fetchOverview } from '../features/overview/overviewApi.js';

const MODULE_TILES = [
  { to: '/overview', title: 'Overview', desc: 'KPIs, trends & upcoming payments' },
  { to: '/revenue', title: 'Revenue', desc: 'Invoices & payment status' },
  { to: '/expenses', title: 'Expenses', desc: 'Categorized company spending' },
  { to: '/salaries', title: 'Salaries', desc: 'Payroll & departmental cost' },
  { to: '/subscriptions', title: 'Subscriptions', desc: 'Recurring SaaS & renewals' },
  { to: '/domains', title: 'Domains', desc: 'Renewals & hosting costs' },
  { to: '/vendors', title: 'Vendors', desc: 'Suppliers & payment history' },
  { to: '/budgets', title: 'Budgets', desc: 'Budget vs actual by department' },
  { to: '/reports', title: 'Reports', desc: '10 financial reports' }
];

const isEmptyDashboard = (data) =>
  data &&
  data.revenue.totalCents === 0 &&
  data.expenses.totalCents === 0 &&
  data.counts.invoices === 0 &&
  data.counts.expenses === 0 &&
  data.counts.salaries === 0 &&
  data.counts.subscriptions === 0 &&
  data.counts.vendors === 0;

function Home() {
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

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-logo-card">
          <img src="/harvik-logo.jpeg" alt="HARVIK — Innovate • Integrate • Elevate" />
        </div>
        <div>
          <span className="brand-badge">
            <span className="pulse-dot" />
            Financial intelligence, engineered
          </span>
        </div>
        <h2 style={{ marginTop: '1rem' }}>Clarity for Every Rupee In and Out.</h2>
        <p>Revenue, spending, salaries, budgets and reports &mdash; one dashboard, live from real data.</p>
        <div className="hero-ctas">
          <a className="btn-primary" href="/overview">View Overview</a>
          <a className="btn-secondary" href="/reports">Explore Reports</a>
        </div>
      </div>

      {state === 'loading' && <Loading message="Loading live financial snapshot..." />}

      {state === 'error' && (
        <div>
          <Error message={`Live snapshot unavailable: ${error}`} />
          <button type="button" className="btn-retry" onClick={load}>Retry</button>
        </div>
      )}

      {state === 'success' && (
        <div>
          {isEmptyDashboard(data) && (
            <Empty message="No financial activity yet. Create an invoice, expense, salary or subscription to populate this dashboard." />
          )}
          <div className="summary-cards">
            <div className="summary-card">
              <span>Total Revenue</span>
              <strong>{data.revenue.total}</strong>
            </div>
            <div className="summary-card">
              <span>Total Expenses</span>
              <strong>{data.expenses.total}</strong>
            </div>
            <div className={`summary-card ${data.net.isLoss ? 'card-loss' : ''}`}>
              <span>Net Income</span>
              <strong className={data.net.isLoss ? 'text-loss' : ''}>{data.net.total}</strong>
            </div>
            <div className="summary-card">
              <span>Pending Payments ({data.pendingPayments.count})</span>
              <strong>{data.pendingPayments.total}</strong>
            </div>
          </div>

          <div className="module-tiles">
            {MODULE_TILES.map((m) => (
              <a key={m.to} className="module-tile" href={m.to}>
                <strong>{m.title}</strong>
                <span>{m.desc}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
