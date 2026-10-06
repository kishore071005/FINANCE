// Thin HTTP client for the Vendors feature.
// No business calculations here — display formatting only.

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

export const fetchVendors = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.name) {
    params.set('name', filters.name);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/vendors${query}`);
  return parseResponse(res);
};

export const fetchVendorById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/vendors/${id}`);
  return parseResponse(res);
};

export const createVendor = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};

export const addVendorPayment = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/vendors/${id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
