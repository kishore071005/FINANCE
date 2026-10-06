import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { EXPENSE_CATEGORIES } from './categories.js';
import { fetchExpenses, fetchExpenseSummary, fetchExpenseById, createExpense } from './expensesApi.js';

const EMPTY_FORM = {
  category: 'SaaS',
  description: '',
  amount: '',
  date: '',
  vendor: '',
  paymentMethod: '',
  department: '',
  receipt: '',
  status: '',
  notes: ''
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!form.category || !EXPENSE_CATEGORIES.includes(form.category)) {
    errors.push('Category must be one of the allowed expense categories');
  }
  if (!form.description.trim()) {
    errors.push('Description is required');
  }
  if (form.amount === '') {
    errors.push('Amount is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) {
    errors.push('Amount must be a valid non-negative amount (max 2 decimals)');
  }
  if (!form.date) {
    errors.push('Date is required');
  }
  if (!form.vendor.trim()) {
    errors.push('Vendor is required');
  }
  if (!form.department.trim()) {
    errors.push('Department is required');
  }
  return errors;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  const loadExpenses = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      if (departmentFilter.trim()) {
        filters.department = departmentFilter.trim();
      }
      const data = await fetchExpenses(filters);
      setExpenses(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [categoryFilter, departmentFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchExpenseSummary();
      setSummary(data);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, [loadExpenses, loadSummary]);

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
        category: form.category,
        description: form.description.trim(),
        amount: form.amount.trim(),
        date: form.date,
        vendor: form.vendor.trim(),
        department: form.department.trim()
      };
      ['paymentMethod', 'receipt', 'status', 'notes'].forEach((key) => {
        if (form[key].trim() !== '') {
          payload[key] = form[key].trim();
        }
      });
      await createExpense(payload);
      setForm(EMPTY_FORM);
      await loadExpenses();
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
      const data = await fetchExpenseById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="expenses-page">
      <h2>Expenses</h2>
      <p className="page-subtitle">Company expenses with categorization and departmental attribution</p>

      {summaryError && <Error message={`Failed to load summary: ${summaryError}`} />}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total</span>
            <strong>{summary.total}</strong>
          </div>
          {Object.entries(summary.byCategory).map(([cat, total]) => (
            <div className="summary-card" key={cat}>
              <span>{cat}</span>
              <strong>{total}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="filters">
        <label>
          Category filter
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Department filter
          <input
            placeholder="e.g. Engineering"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => { loadExpenses(); loadSummary(); }}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading expenses..." />}
      {fetchState === 'error' && <Error message={`Failed to load expenses: ${fetchError}`} />}
      {fetchState === 'success' && expenses.length === 0 && (
        <Empty message="No expenses found. Create the first one below." />
      )}
      {fetchState === 'success' && expenses.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Department</th>
              <th>Vendor</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} onClick={() => handleSelect(exp.id)} className={selected && selected.id === exp.id ? 'selected-row' : ''}>
                <td>{formatDate(exp.date)}</td>
                <td>{exp.description}</td>
                <td>{exp.category}</td>
                <td>{exp.department}</td>
                <td>{exp.vendor}</td>
                <td>{exp.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading expense details..." />}
      {detailState === 'error' && <Error message={`Failed to load expense: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.description}</h3>
          <p>Category: {selected.category} | Department: {selected.department}</p>
          <p>Vendor: {selected.vendor} | Amount: {selected.amount}</p>
          <p>Date: {formatDate(selected.date)}</p>
          {selected.paymentMethod && <p>Payment Method: {selected.paymentMethod}</p>}
          {selected.status && <p>Status: {selected.status}</p>}
          {selected.receipt && <p>Receipt: {selected.receipt}</p>}
          {selected.notes && <p>Notes: {selected.notes}</p>}
        </div>
      )}

      <div className="form-panel">
        <h3>Create Expense</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Description<input name="description" value={form.description} onChange={handleChange} /></label>
          <label>Amount<input name="amount" placeholder="e.g. 99.99" value={form.amount} onChange={handleChange} /></label>
          <label>Date<input type="date" name="date" value={form.date} onChange={handleChange} /></label>
          <label>Vendor<input name="vendor" value={form.vendor} onChange={handleChange} /></label>
          <label>Department<input name="department" placeholder="e.g. Engineering" value={form.department} onChange={handleChange} /></label>
          <label>Payment Method (optional)<input name="paymentMethod" value={form.paymentMethod} onChange={handleChange} /></label>
          <label>Status (optional)<input name="status" value={form.status} onChange={handleChange} /></label>
          <label>Receipt (optional)<input name="receipt" value={form.receipt} onChange={handleChange} /></label>
          <label>Notes (optional)<input name="notes" value={form.notes} onChange={handleChange} /></label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Expense'}</button>
        </form>
      </div>
    </div>
  );
}

export default ExpensesPage;
