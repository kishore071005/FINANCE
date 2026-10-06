import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchSubscriptions, fetchSubscriptionSummary, fetchSubscriptionById, createSubscription } from './subscriptionsApi.js';

const CYCLES = ['Monthly', 'Annual'];
const STATUSES = ['Active', 'Inactive'];

const EMPTY_FORM = {
  serviceName: '',
  provider: '',
  category: '',
  cost: '',
  billingCycle: 'Monthly',
  startDate: '',
  renewalDate: '',
  paymentMethod: '',
  owner: '',
  department: '',
  status: 'Active'
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!form.serviceName.trim()) {
    errors.push('Service name is required');
  }
  if (form.cost === '') {
    errors.push('Cost is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.cost.trim())) {
    errors.push('Cost must be a valid non-negative amount (max 2 decimals)');
  }
  if (!CYCLES.includes(form.billingCycle)) {
    errors.push('Billing cycle must be Monthly or Annual');
  }
  if (!form.renewalDate) {
    errors.push('Renewal date is required');
  }
  if (form.status && !STATUSES.includes(form.status)) {
    errors.push('Status must be Active or Inactive');
  }
  return errors;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

// Display-only renewal indicator. No renewal-window rule (undefined).
const renewalHint = (renewalDate, status) => {
  if (status !== 'Active' || !renewalDate) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((new Date(renewalDate).getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) {
    return 'Renewal overdue';
  }
  if (diffDays === 0) {
    return 'Renews today';
  }
  return `Renews in ${diffDays}d`;
};

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [detailError, setDetailError] = useState('');

  const loadSubscriptions = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (statusFilter) {
        filters.status = statusFilter;
      }
      if (cycleFilter) {
        filters.billingCycle = cycleFilter;
      }
      const data = await fetchSubscriptions(filters);
      setSubscriptions(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [statusFilter, cycleFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSubscriptionSummary();
      setSummary(data);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
    loadSummary();
  }, [loadSubscriptions, loadSummary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    setSubmitError('');
    if (errors.length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        cost: form.cost.trim(),
        billingCycle: form.billingCycle,
        renewalDate: form.renewalDate,
        status: form.status
      };
      ['provider', 'category', 'startDate', 'paymentMethod', 'owner', 'department'].forEach((key) => {
        if (form[key].trim() !== '') {
          payload[key] = form[key].trim();
        }
      });
      await createSubscription(payload);
      setForm(EMPTY_FORM);
      await loadSubscriptions();
      await loadSummary();
    } catch (err) {
      setSubmitError(err.details ? `${err.message}: ${err.details.join('; ')}` : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = async (id) => {
    setDetailState('loading');
    setDetailError('');
    try {
      const data = await fetchSubscriptionById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="subscriptions-page">
      <h2>Subscriptions</h2>
      <p className="page-subtitle">Recurring SaaS subscriptions, renewals, and normalized monthly costs</p>

      {summaryError && <Error message={`Failed to load summary: ${summaryError}`} />}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>Monthly Cost (active)</span>
            <strong>{summary.totalMonthly}</strong>
          </div>
          <div className="summary-card">
            <span>Active Subscriptions</span>
            <strong>{summary.activeCount}</strong>
          </div>
        </div>
      )}

      {summary && summary.upcomingRenewals.length > 0 && (
        <div className="detail-panel">
          <h3>Upcoming Renewals</h3>
          {summary.upcomingRenewals.map((sub) => (
            <p key={sub.id}>
              {sub.serviceName} — {formatDate(sub.renewalDate)} ({sub.monthlyCost}/mo)
            </p>
          ))}
        </div>
      )}

      <div className="filters">
        <label>
          Status filter
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Billing cycle filter
          <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)}>
            <option value="">All cycles</option>
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { loadSubscriptions(); loadSummary(); }}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading subscriptions..." />}
      {fetchState === 'error' && <Error message={`Failed to load subscriptions: ${fetchError}`} />}
      {fetchState === 'success' && subscriptions.length === 0 && (
        <Empty message="No subscriptions found. Create the first one below." />
      )}
      {fetchState === 'success' && subscriptions.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Cycle</th>
              <th>Cost</th>
              <th>Monthly</th>
              <th>Renewal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} onClick={() => handleSelect(sub.id)} className={selected && selected.id === sub.id ? 'selected-row' : ''}>
                <td>{sub.serviceName}</td>
                <td><span className={`status-badge ${sub.billingCycle === 'Monthly' ? 'status-partial' : 'status-pending'}`}>{sub.billingCycle}</span></td>
                <td>{sub.cost}</td>
                <td>{sub.monthlyCost}</td>
                <td>{formatDate(sub.renewalDate)}{renewalHint(sub.renewalDate, sub.status) ? ` (${renewalHint(sub.renewalDate, sub.status)})` : ''}</td>
                <td><span className={`status-badge ${sub.status === 'Active' ? 'status-paid' : 'status-unknown'}`}>{sub.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading subscription details..." />}
      {detailState === 'error' && <Error message={`Failed to load subscription: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.serviceName}</h3>
          <p>Billing: {selected.billingCycle} {selected.cost} → {selected.monthlyCost}/mo</p>
          <p>Renewal Date: {formatDate(selected.renewalDate)}</p>
          <p>Start Date: {formatDate(selected.startDate)}</p>
          {selected.provider && <p>Provider: {selected.provider}</p>}
          {selected.owner && <p>Owner: {selected.owner}</p>}
          {selected.department && <p>Department: {selected.department}</p>}
        </div>
      )}

      <div className="form-panel">
        <h3>Create Subscription</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Service Name<input name="serviceName" value={form.serviceName} onChange={handleChange} /></label>
          <label>Provider (optional)<input name="provider" value={form.provider} onChange={handleChange} /></label>
          <label>Category (optional)<input name="category" value={form.category} onChange={handleChange} /></label>
          <label>Cost (per billing cycle)<input name="cost" placeholder="e.g. 120.00" value={form.cost} onChange={handleChange} /></label>
          <label>Billing Cycle
            <select name="billingCycle" value={form.billingCycle} onChange={handleChange}>
              {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Start Date (optional)<input type="date" name="startDate" value={form.startDate} onChange={handleChange} /></label>
          <label>Renewal Date<input type="date" name="renewalDate" value={form.renewalDate} onChange={handleChange} /></label>
          <label>Payment Method (optional)<input name="paymentMethod" value={form.paymentMethod} onChange={handleChange} /></label>
          <label>Owner (optional)<input name="owner" value={form.owner} onChange={handleChange} /></label>
          <label>Department (optional)<input name="department" value={form.department} onChange={handleChange} /></label>
          <label>Status
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Subscription'}</button>
        </form>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
