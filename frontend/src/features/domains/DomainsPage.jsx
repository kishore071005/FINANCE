import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchDomains, fetchDomainSummary, fetchDomainById, createDomain } from './domainsApi.js';

const EMPTY_FORM = {
  domainName: '',
  registrar: '',
  purchaseDate: '',
  renewalDate: '',
  renewalCost: '',
  hostingProvider: '',
  hostingCost: '',
  status: ''
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!form.domainName.trim()) {
    errors.push('Domain name is required');
  }
  if (!form.registrar.trim()) {
    errors.push('Registrar is required');
  }
  if (!form.renewalDate) {
    errors.push('Renewal date is required');
  }
  if (form.renewalCost === '') {
    errors.push('Renewal cost is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.renewalCost.trim())) {
    errors.push('Renewal cost must be a valid non-negative amount (max 2 decimals)');
  }
  if (!form.hostingProvider.trim()) {
    errors.push('Hosting provider is required');
  }
  if (form.hostingCost === '') {
    errors.push('Hosting cost is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.hostingCost.trim())) {
    errors.push('Hosting cost must be a valid non-negative amount (max 2 decimals)');
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
const renewalHint = (renewalDate) => {
  if (!renewalDate) {
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

function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [registrarFilter, setRegistrarFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [detailError, setDetailError] = useState('');

  const loadDomains = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (registrarFilter.trim()) {
        filters.registrar = registrarFilter.trim();
      }
      const data = await fetchDomains(filters);
      setDomains(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [registrarFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchDomainSummary();
      setSummary(data);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadDomains();
    loadSummary();
  }, [loadDomains, loadSummary]);

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
        domainName: form.domainName.trim(),
        registrar: form.registrar.trim(),
        renewalDate: form.renewalDate,
        renewalCost: form.renewalCost.trim(),
        hostingProvider: form.hostingProvider.trim(),
        hostingCost: form.hostingCost.trim()
      };
      if (form.purchaseDate) {
        payload.purchaseDate = form.purchaseDate;
      }
      if (form.status.trim() !== '') {
        payload.status = form.status.trim();
      }
      await createDomain(payload);
      setForm(EMPTY_FORM);
      await loadDomains();
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
      const data = await fetchDomainById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="domains-page">
      <h2>Domains / Hosting</h2>
      <p className="page-subtitle">Domain renewals, registrars, and hosting costs</p>

      {summaryError && <Error message={`Failed to load summary: ${summaryError}`} />}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total Renewal Cost</span>
            <strong>{summary.totalRenewalCost}</strong>
          </div>
          <div className="summary-card">
            <span>Total Hosting Cost</span>
            <strong>{summary.totalHostingCost}</strong>
          </div>
          <div className="summary-card">
            <span>Tracked Domains</span>
            <strong>{summary.count}</strong>
          </div>
        </div>
      )}

      {summary && summary.upcomingRenewals.length > 0 && (
        <div className="detail-panel">
          <h3>Upcoming Renewals</h3>
          {summary.upcomingRenewals.map((d) => (
            <p key={d.id}>
              {d.domainName} ({d.registrar}) — {formatDate(d.renewalDate)}
            </p>
          ))}
        </div>
      )}

      <div className="filters">
        <label>
          Registrar filter
          <input
            placeholder="e.g. GoDaddy"
            value={registrarFilter}
            onChange={(e) => setRegistrarFilter(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => { loadDomains(); loadSummary(); }}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading domains..." />}
      {fetchState === 'error' && <Error message={`Failed to load domains: ${fetchError}`} />}
      {fetchState === 'success' && domains.length === 0 && (
        <Empty message="No domains found. Create the first one below." />
      )}
      {fetchState === 'success' && domains.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Registrar</th>
              <th>Renewal</th>
              <th>Renewal Cost</th>
              <th>Hosting Provider</th>
              <th>Hosting Cost</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.id} onClick={() => handleSelect(d.id)} className={selected && selected.id === d.id ? 'selected-row' : ''}>
                <td>{d.domainName}</td>
                <td>{d.registrar}</td>
                <td>{formatDate(d.renewalDate)}{renewalHint(d.renewalDate) ? ` (${renewalHint(d.renewalDate)})` : ''}</td>
                <td>{d.renewalCost}</td>
                <td>{d.hostingProvider}</td>
                <td>{d.hostingCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading domain details..." />}
      {detailState === 'error' && <Error message={`Failed to load domain: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.domainName}</h3>
          <p>Registrar: {selected.registrar} | Renewal: {formatDate(selected.renewalDate)} ({selected.renewalCost})</p>
          <p>Hosting: {selected.hostingProvider} ({selected.hostingCost})</p>
          <p>Purchase Date: {formatDate(selected.purchaseDate)}</p>
          {selected.status && <p>Status: {selected.status}</p>}
        </div>
      )}

      <div className="form-panel">
        <h3>Create Domain Record</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Domain Name<input name="domainName" placeholder="e.g. example.com" value={form.domainName} onChange={handleChange} /></label>
          <label>Registrar<input name="registrar" value={form.registrar} onChange={handleChange} /></label>
          <label>Purchase Date (optional)<input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} /></label>
          <label>Renewal Date<input type="date" name="renewalDate" value={form.renewalDate} onChange={handleChange} /></label>
          <label>Renewal Cost<input name="renewalCost" placeholder="e.g. 12.99" value={form.renewalCost} onChange={handleChange} /></label>
          <label>Hosting Provider<input name="hostingProvider" value={form.hostingProvider} onChange={handleChange} /></label>
          <label>Hosting Cost<input name="hostingCost" placeholder="e.g. 5.00" value={form.hostingCost} onChange={handleChange} /></label>
          <label>Status (optional)<input name="status" value={form.status} onChange={handleChange} /></label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Domain Record'}</button>
        </form>
      </div>
    </div>
  );
}

export default DomainsPage;
