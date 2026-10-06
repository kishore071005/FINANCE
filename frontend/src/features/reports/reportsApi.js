// Thin HTTP client for Financial Reports.
// Follows harness guidelines: display formatting only, no business calculations.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const fetchReports = async () => {
  const res = await fetch(`${BASE_URL}/api/reports`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = new Error(body.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.details = body.errors || null;
    throw err;
  }
  return body.data;
};

export const fetchReportByType = async (type) => {
  const res = await fetch(`${BASE_URL}/api/reports/${type}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const err = new Error(body.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.details = body.errors || null;
    throw err;
  }
  return body.data;
};
