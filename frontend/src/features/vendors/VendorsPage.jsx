import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/common/Loading.jsx';
import Empty from '../../components/common/Empty.jsx';
import Error from '../../components/common/Error.jsx';
import { fetchVendors, fetchVendorById, createVendor, addVendorPayment } from './vendorsApi.js';

const EMPTY_FORM = {
  name: '',
  contact: '',
  serviceProvided: '',
  paymentTerms: '',
  contract: ''
};

const EMPTY_PAYMENT = {
  amount: '',
  status: 'Paid',
  date: '',
  reference: ''
};

// Client-side pre-validation only (backend re-validates everything).
const validateVendorForm = (form) => {
  const errors = [];
  if (!form.name.trim()) {
    errors.push('Vendor name is required');
  }
  if (!form.contact.trim()) {
    errors.push('Contact is required');
  }
  if (!form.paymentTerms.trim()) {
    errors.push('Payment terms are required');
  }
  return errors;
};

const validatePaymentForm = (form) => {
  const errors = [];
  if (form.amount === '') {
    errors.push('Payment amount is required');
  } else if (!/^\d+(\.\d{1,2})?$/.test(form.amount.trim())) {
    errors.push('Payment amount must be a valid non-negative amount (max 2 decimals)');
  }
  if (!['Paid', 'Pending'].includes(form.status)) {
    errors.push('Payment status must be Paid or Pending');
  }
  return errors;
};

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [fetchState, setFetchState] = useState('loading');
  const [fetchError, setFetchError] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [detailError, setDetailError] = useState('');
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [paymentErrors, setPaymentErrors] = useState([]);
  const [paymentError, setPaymentError] = useState('');

  const loadVendors = useCallback(async () => {
    setFetchState('loading');
    setFetchError('');
    try {
      const filters = {};
      if (nameFilter.trim()) {
        filters.name = nameFilter.trim();
      }
      const data = await fetchVendors(filters);
      setVendors(data);
      setFetchState('success');
    } catch (err) {
      setFetchError(err.message);
      setFetchState('error');
    }
  }, [nameFilter]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateVendorForm(form);
    setFormErrors(errors);
    setSubmitError('');
    if (errors.length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        contact: form.contact.trim(),
        paymentTerms: form.paymentTerms.trim()
      };
      if (form.serviceProvided.trim() !== '') {
        payload.serviceProvided = form.serviceProvided.trim();
      }
      if (form.contract.trim() !== '') {
        payload.contract = form.contract.trim();
      }
      await createVendor(payload);
      setForm(EMPTY_FORM);
      await loadVendors();
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
      const data = await fetchVendorById(id);
      setSelected(data);
      setDetailState('success');
    } catch (err) {
      setDetailError(err.message);
      setDetailState('error');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selected) {
      return;
    }
    const errors = validatePaymentForm(payment);
    setPaymentErrors(errors);
    setPaymentError('');
    if (errors.length > 0) {
      return;
    }
    try {
      const payload = {
        amount: payment.amount.trim(),
        status: payment.status
      };
      if (payment.date) {
        payload.date = payment.date;
      }
      if (payment.reference.trim() !== '') {
        payload.reference = payment.reference.trim();
      }
      const updated = await addVendorPayment(selected.id, payload);
      setSelected(updated);
      setPayment(EMPTY_PAYMENT);
      await loadVendors();
    } catch (err) {
      setPaymentError(err.details ? `${err.message}: ${err.details.join('; ')}` : err.message);
    }
  };

  return (
    <div className="vendors-page">
      <h2>Vendors</h2>
      <p className="page-subtitle">Vendor records with derived payment totals</p>

      <div className="filters">
        <label>
          Name filter
          <input
            placeholder="e.g. Acme Corp"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </label>
        <button type="button" onClick={loadVendors}>Refresh</button>
      </div>

      {fetchState === 'loading' && <Loading message="Loading vendors..." />}
      {fetchState === 'error' && <Error message={`Failed to load vendors: ${fetchError}`} />}
      {fetchState === 'success' && vendors.length === 0 && (
        <Empty message="No vendors found. Create the first one below." />
      )}
      {fetchState === 'success' && vendors.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>Payment Terms</th>
              <th>Total Paid</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} onClick={() => handleSelect(v.id)} className={selected && selected.id === v.id ? 'selected-row' : ''}>
                <td>{v.name}</td>
                <td>{v.contact}</td>
                <td>{v.paymentTerms}</td>
                <td>{v.totalPaid}</td>
                <td>{v.pendingAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailState === 'loading' && <Loading message="Loading vendor details..." />}
      {detailState === 'error' && <Error message={`Failed to load vendor: ${detailError}`} />}
      {detailState === 'success' && selected && (
        <div className="detail-panel">
          <h3>{selected.name}</h3>
          <p>Contact: {selected.contact} | Terms: {selected.paymentTerms}</p>
          {selected.serviceProvided && <p>Service: {selected.serviceProvided}</p>}
          {selected.contract && <p>Contract: {selected.contract}</p>}
          <p>Total Paid: {selected.totalPaid} | Pending: {selected.pendingAmount}</p>
          <h4>Payment History ({selected.paymentCount})</h4>
          {selected.payments.length === 0 && <p>No payments recorded yet.</p>}
          {selected.payments.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {selected.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.amount}</td>
                    <td><span className={`status-badge ${p.status === 'Paid' ? 'status-paid' : 'status-pending'}`}>{p.status}</span></td>
                    <td>{p.date ? new Date(p.date).toLocaleDateString() : '-'}</td>
                    <td>{p.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="form-panel">
            <h4>Record Payment</h4>
            {paymentErrors.length > 0 && (
              <div className="error">
                {paymentErrors.map((e) => <p key={e}>{e}</p>)}
              </div>
            )}
            {paymentError && <Error message={paymentError} />}
            <form onSubmit={handleAddPayment}>
              <label>Amount<input name="amount" placeholder="e.g. 250.00" value={payment.amount} onChange={handlePaymentChange} /></label>
              <label>Status
                <select name="status" value={payment.status} onChange={handlePaymentChange}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>
              <label>Date (optional)<input type="date" name="date" value={payment.date} onChange={handlePaymentChange} /></label>
              <label>Reference (optional)<input name="reference" value={payment.reference} onChange={handlePaymentChange} /></label>
              <button type="submit">Record Payment</button>
            </form>
          </div>
        </div>
      )}

      <div className="form-panel">
        <h3>Create Vendor</h3>
        {formErrors.length > 0 && (
          <div className="error">
            {formErrors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {submitError && <Error message={submitError} />}
        <form onSubmit={handleSubmit}>
          <label>Vendor Name<input name="name" value={form.name} onChange={handleChange} /></label>
          <label>Contact<input name="contact" placeholder="e.g. billing@acme.com" value={form.contact} onChange={handleChange} /></label>
          <label>Service Provided (optional)<input name="serviceProvided" value={form.serviceProvided} onChange={handleChange} /></label>
          <label>Payment Terms<input name="paymentTerms" placeholder="e.g. Net 30" value={form.paymentTerms} onChange={handleChange} /></label>
          <label>Contract (optional)<input name="contract" value={form.contract} onChange={handleChange} /></label>
          <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Vendor'}</button>
        </form>
      </div>
    </div>
  );
}

export default VendorsPage;
