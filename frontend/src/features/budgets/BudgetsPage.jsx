import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { BUDGET_DEPARTMENTS } from './departments.js';
import { fetchBudgets, fetchBudgetSummary, fetchBudgetById, createBudget } from './budgetsApi.js';

const EMPTY_FORM = {
  department: 'Technology',
  budget: ''
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!BUDGET_DEPARTMENTS.includes(form.department)) {
    errors.push('Department must be one of: HR, Sales, Marketing, Operations, Technology, Other');
  }
  if (form.budget === '') {
    errors.push('Budget is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.budget.trim())) {
    errors.push('Budget must be a valid non-negative amount (max 2 decimals)');
  }
  return errors;
};

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [detailError, setDetailError] = useState('');

  const loadBudgets = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (departmentFilter) {
        filters.department = departmentFilter;
      }
      const data = await fetchBudgets(filters);
      setBudgets(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [departmentFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchBudgetSummary();
      setSummary(data);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
    loadSummary();
  }, [loadBudgets, loadSummary]);

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
      await createBudget({
        department: form.department,
        budget: form.budget.trim()
      });
      setForm(EMPTY_FORM);
      await loadBudgets();
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
      const data = await fetchBudgetById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="budgets-page">
      <h2>Budgets</h2>
      <p className="page-subtitle">Departmental budgets vs actual spending (from expenses + salaries)</p>

      {summaryError && <Error message={`Failed to load summary: ${summaryError}`} />}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total Budget</span>
            <strong>{summary.totalBudget}</strong>
          </div>
          <div className="summary-card">
            <span>Total Actual</span>
            <strong>{summary.totalActual}</strong>
          </div>
          <div className="summary-card">
            <span>Total Remaining</span>
            <strong>{summary.totalRemaining}</strong>
          </div>
        </div>
      )}

      <div className="filters">
        <label>
          Department filter
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All departments</option>
            {BUDGET_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { loadBudgets(); loadSummary(); }}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading budgets..." />}
      {fetchState === 'error' && <Error message={`Failed to load budgets: ${fetchError}`} />}
      {fetchState === 'success' && budgets.length === 0 && (
        <Empty message="No budgets found. Create the first one below." />
      )}
      {fetchState === 'success' && budgets.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Budget</th>
              <th>Actual</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b.id} onClick={() => handleSelect(b.id)} className={selected && selected.id === b.id ? 'selected-row' : ''}>
                <td>{b.department}</td>
                <td>{b.budget}</td>
                <td>{b.actualSpending}</td>
                <td>{b.remaining}</td>
                <td>
                  {b.overrun
                    ? <span className="status-badge status-overdue">Overrun</span>
                    : <span className="status-badge status-paid">On track</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading budget details..." />}
      {detailState === 'error' && <Error message={`Failed to load budget: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.department}</h3>
          <p>Budget: {selected.budget} | Actual: {selected.actualSpending} (expenses {selected.expenseSpending} + salaries {selected.salarySpending})</p>
          <p>Remaining: {selected.remaining} {selected.overrun ? '(overrun)' : ''}</p>
        </div>
      )}

      <div className="form-panel">
        <h3>Create Budget</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Department
            <select name="department" value={form.department} onChange={handleChange}>
              {BUDGET_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>Budget Amount<input name="budget" placeholder="e.g. 100000.00" value={form.budget} onChange={handleChange} /></label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Budget'}</button>
        </form>
      </div>
    </div>
  );
}

export default BudgetsPage;
