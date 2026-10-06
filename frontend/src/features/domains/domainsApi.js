// Thin HTTP client for the Domains feature.
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

export const fetchDomains = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.registrar) {
    params.set('registrar', filters.registrar);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/domains${query}`);
  return parseResponse(res);
};

export const fetchDomainSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/domains/summary`);
  return parseResponse(res);
};

export const fetchDomainById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/domains/${id}`);
  return parseResponse(res);
};

export const createDomain = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
