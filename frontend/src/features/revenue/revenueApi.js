// Thin HTTP client for the Revenue feature.
// No business calculations here — display formatting only.
// Backend owns validation, status rules, and monetary math.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const parseResponse = async (res) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = new Error(body.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.details = body.errors || null;
    throw err;
  }
  return body.data;
};

export const fetchInvoices = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.paymentStatus) {
    params.set('paymentStatus', filters.paymentStatus);
  }
  if (filters.customer) {
    params.set('customer', filters.customer);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/revenue${query}`);
  return parseResponse(res);
};

export const fetchInvoiceById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/revenue/${id}`);
  return parseResponse(res);
};

export const createInvoice = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/revenue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};

export const updateInvoice = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/revenue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
