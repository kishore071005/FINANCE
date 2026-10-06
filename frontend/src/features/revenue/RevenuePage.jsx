import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import StatusBadge from './StatusBadge.jsx';
import { fetchInvoices, fetchInvoiceById, createInvoice } from './revenueApi.js';

const STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue'];

const EMPTY_FORM = {
  customer: '',
  invoiceNumber: '',
  invoiceDate: '',
  amount: '',
  tax: '',
  dueDate: '',
  paymentDate: '',
  paymentStatus: 'Pending'
};

// Client-side pre-validation only (backend re-validates everything).
const validateForm = (form) => {
  const errors = [];
  if (!form.customer.trim()) {
    errors.push('Customer is required');
  }
  if (!form.invoiceNumber.trim()) {
    errors.push('Invoice Number is required');
  }
  if (!form.invoiceDate) {
    errors.push('Invoice Date is required');
  }
  if (form.amount === '') {
    errors.push('Amount is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) {
    errors.push('Amount must be a valid non-negative amount (max 2 decimals)');
  }
  if (form.tax !== '' && !/^\d+(\.\d{1,2})?$/.test(form.tax.trim())) {
    errors.push('Tax must be a valid non-negative amount (max 2 decimals)');
  }
  if (form.paymentStatus && !STATUSES.includes(form.paymentStatus)) {
    errors.push('Payment Status is invalid');
  }
  return errors;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
};

function RevenuePage() {
  const [invoices, setInvoices] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [detailError, setDetailError] = useState('');

  const loadInvoices = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const data = await fetchInvoices(statusFilter ? { paymentStatus: statusFilter } : {});
      setInvoices(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

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
      await createInvoice({
        customer: form.customer.trim(),
        invoiceNumber: form.invoiceNumber.trim(),
        invoiceDate: form.invoiceDate,
        amount: form.amount.trim(),
        ...(form.tax !== '' ? { tax: form.tax.trim() } : {}),
        ...(form.dueDate ? { dueDate: form.dueDate } : {}),
        ...(form.paymentDate ? { paymentDate: form.paymentDate } : {}),
        paymentStatus: form.paymentStatus
      });
      setForm(EMPTY_FORM);
      await loadInvoices();
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
      const data = await fetchInvoiceById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  return (
    <div className="revenue-page">
      <h2>Revenue</h2>
      <p className="page-subtitle">Customer invoices and incoming payments</p>

      <div className="filters">
        <label>
          Status filter
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={loadInvoices}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading invoices..." />}
      {fetchState === 'error' && <Error message={`Failed to load invoices: ${fetchError}`} />}
      {fetchState === 'success' && invoices.length === 0 && (
        <Empty message={statusFilter ? `No ${statusFilter} invoices found` : 'No invoices yet. Create the first one below.'} />
      )}
      {fetchState === 'success' && invoices.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Invoice Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} onClick={() => handleSelect(inv.id)} className={selected && selected.id === inv.id ? 'selected-row' : ''}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.customer}</td>
                <td>{formatDate(inv.invoiceDate)}</td>
                <td>{inv.amount}</td>
                <td><StatusBadge status={inv.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading invoice details..." />}
      {detailState === 'error' && <Error message={`Failed to load invoice: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>Invoice {selected.invoiceNumber}</h3>
          <p>Customer: {selected.customer}</p>
          <p>Amount: {selected.amount} (Tax: {selected.tax})</p>
          <p>Invoice Date: {formatDate(selected.invoiceDate)}</p>
          <p>Due Date: {formatDate(selected.dueDate)}</p>
          <p>Payment Date: {formatDate(selected.paymentDate)}</p>
          <p>Status: <StatusBadge status={selected.paymentStatus} /></p>
        </div>
      )}

      <div className="form-panel">
        <h3>Create Invoice</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Customer<input name="customer" value={form.customer} onChange={handleChange} /></label>
          <label>Invoice Number<input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} /></label>
          <label>Invoice Date<input type="date" name="invoiceDate" value={form.invoiceDate} onChange={handleChange} /></label>
          <label>Amount<input name="amount" placeholder="e.g. 100.50" value={form.amount} onChange={handleChange} /></label>
          <label>Tax (optional)<input name="tax" placeholder="e.g. 5.00" value={form.tax} onChange={handleChange} /></label>
          <label>Due Date (optional)<input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} /></label>
          <label>Payment Date (optional)<input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} /></label>
          <label>Status
            <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</button>
        </form>
      </div>
    </div>
  );
}

export default RevenuePage;
