// Thin HTTP client for the Budgets feature.
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

export const fetchBudgets = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.department) {
    params.set('department', filters.department);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/budgets${query}`);
  return parseResponse(res);
};

export const fetchBudgetSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/budgets/summary`);
  return parseResponse(res);
};

export const fetchBudgetById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/budgets/${id}`);
  return parseResponse(res);
};

export const createBudget = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
