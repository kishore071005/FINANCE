// Thin HTTP client for the Salaries feature.
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

export const fetchSalaries = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.department) {
    params.set('department', filters.department);
  }
  if (filters.employee) {
    params.set('employee', filters.employee);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/salaries${query}`);
  return parseResponse(res);
};

export const fetchSalarySummary = async () => {
  const res = await fetch(`${BASE_URL}/api/salaries/summary`);
  return parseResponse(res);
};

export const fetchSalaryById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/salaries/${id}`);
  return parseResponse(res);
};

export const createSalary = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/salaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
