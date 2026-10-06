// Thin HTTP client for the Subscriptions feature.
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

export const fetchSubscriptions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.billingCycle) {
    params.set('billingCycle', filters.billingCycle);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/subscriptions${query}`);
  return parseResponse(res);
};

export const fetchSubscriptionSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/subscriptions/summary`);
  return parseResponse(res);
};

export const fetchSubscriptionById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/subscriptions/${id}`);
  return parseResponse(res);
};

export const createSubscription = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
};
