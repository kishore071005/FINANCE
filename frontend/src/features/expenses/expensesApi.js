// Thin HTTP client for the Expenses feature.
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

export const fetchExpenses = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.department) {
    params.set('department', filters.department);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/expenses${query}`);
  return parseResponse(res);
};

export const fetchExpenseSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/expenses/summary`);
  return parseResponse(res);
};

export const fetchExpenseById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/expenses/${id}`);
  return parseResponse(res);
};

export const createExpense = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
