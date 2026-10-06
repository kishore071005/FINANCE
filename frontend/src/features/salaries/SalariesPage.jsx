import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchSalaries, fetchSalarySummary, fetchSalaryById, createSalary } from './salariesApi.js';

const EMPTY_FORM = {
  employee: '',
  salary: '',
  department: '',
  employmentType: '',
  deductions: '',
  paymentStatus: '',
  paymentDate: '',
  notes: ''
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!form.employee.trim()) {
    errors.push('Employee is required');
  }
  if (form.salary === '') {
    errors.push('Salary is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.salary.trim())) {
    errors.push('Salary must be a valid non-negative amount (max 2 decimals)');
  }
  if (!form.department.trim()) {
    errors.push('Department is required');
  }
  if (form.deductions !== '' && !/^\d+(\.\d{1,2})?$/.test(form.deductions.trim())) {
    errors.push('Deductions must be a valid non-negative amount (max 2 decimals)');
  }
  return errors;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

function SalariesPage() {
  const [records, setRecords] = useState([]);
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

  const loadSalaries = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (departmentFilter.trim()) {
        filters.department = departmentFilter.trim();
      }
      const data = await fetchSalaries(filters);
      setRecords(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [departmentFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSalarySummary();
      setSummary(data);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
    loadSummary();
  }, [loadSalaries, loadSummary]);

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
        employee: form.employee.trim(),
        salary: form.salary.trim(),
        department: form.department.trim()
      };
      if (form.deductions.trim() !== '') {
        payload.deductions = form.deductions.trim();
      }
      ['employmentType', 'paymentStatus', 'paymentDate', 'notes'].forEach((key) => {
        if (form[key].trim() !== '') {
          payload[key] = form[key].trim();
        }
      });
      await createSalary(payload);
      setForm(EMPTY_FORM);
      await loadSalaries();
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
      const data = await fetchSalaryById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="salaries-page">
      <h2>Salaries</h2>
      <p className="page-subtitle">Employee salaries, stipends, and departmental costs</p>

      {summaryError && <Error message={`Failed to load summary: ${summaryError}`} />}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total Monthly Cost</span>
            <strong>{summary.totalMonthlyCost}</strong>
          </div>
          {Object.entries(summary.byDepartment).map(([dept, total]) => (
            <div className="summary-card" key={dept}>
              <span>{dept}</span>
              <strong>{total}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="filters">
        <label>
          Department filter
          <input
            placeholder="e.g. Engineering"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => { loadSalaries(); loadSummary(); }}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading salary records..." />}
      {fetchState === 'error' && <Error message={`Failed to load salary records: ${fetchError}`} />}
      {fetchState === 'success' && records.length === 0 && (
        <Empty message="No salary records found. Create the first one below." />
      )}
      {fetchState === 'success' && records.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Monthly Cost</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} onClick={() => handleSelect(rec.id)} className={selected && selected.id === rec.id ? 'selected-row' : ''}>
                <td>{rec.employee}</td>
                <td>{rec.department}</td>
                <td>{rec.salary}</td>
                <td>{rec.deductions}</td>
                <td>{rec.monthlyCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading record details..." />}
      {detailState === 'error' && <Error message={`Failed to load record: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.employee}</h3>
          <p>Department: {selected.department}</p>
          <p>Gross: {selected.salary} | Deductions: {selected.deductions} | Monthly Cost: {selected.monthlyCost}</p>
          {selected.employmentType && <p>Employment Type: {selected.employmentType}</p>}
          {selected.paymentStatus && <p>Payment Status: {selected.paymentStatus}</p>}
          <p>Payment Date: {formatDate(selected.paymentDate)}</p>
          {selected.notes && <p>Notes: {selected.notes}</p>}
        </div>
      )}

      <div className="form-panel">
        <h3>Create Salary Record</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Employee<input name="employee" value={form.employee} onChange={handleChange} /></label>
          <label>Salary / Stipend (monthly)<input name="salary" placeholder="e.g. 5000.00" value={form.salary} onChange={handleChange} /></label>
          <label>Department<input name="department" placeholder="e.g. Engineering" value={form.department} onChange={handleChange} /></label>
          <label>Employment Type (optional)<input name="employmentType" value={form.employmentType} onChange={handleChange} /></label>
          <label>Deductions (optional)<input name="deductions" placeholder="e.g. 500.00" value={form.deductions} onChange={handleChange} /></label>
          <label>Payment Status (optional)<input name="paymentStatus" value={form.paymentStatus} onChange={handleChange} /></label>
          <label>Payment Date (optional)<input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} /></label>
          <label>Notes (optional)<input name="notes" value={form.notes} onChange={handleChange} /></label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Salary Record'}</button>
        </form>
      </div>
    </div>
  );
}

export default SalariesPage;
