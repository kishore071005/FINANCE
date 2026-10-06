const {
  toMinorUnits,
  toMajorUnits,
  normalizeMonthly,
  totalMonthlyCost,
  upcomingRenewals
} = require('../../backend/src/modules/subscriptions/subscription.service');

describe('Monthly cost normalization (documented formula)', () => {
  it('passes monthly costs through unchanged', () => {
    expect(normalizeMonthly(999, 'Monthly')).toBe(999);
    expect(normalizeMonthly(0, 'Monthly')).toBe(0);
  });

  it('converts annual cost as round(cost / 12)', () => {
    expect(normalizeMonthly(12000, 'Annual')).toBe(1000); // 120.00 → 10.00/mo
    expect(normalizeMonthly(toMinorUnits(1200), 'Annual')).toBe(toMinorUnits(100));
  });

  it('rounds uneven annual amounts to the nearest cent', () => {
    expect(normalizeMonthly(10000, 'Annual')).toBe(833); // 100.00 → 8.33/mo
    expect(toMajorUnits(normalizeMonthly(10000, 'Annual'))).toBe(8.33);
  });

  it('never equates annual cost with monthly cost', () => {
    expect(normalizeMonthly(12000, 'Annual')).not.toBe(12000);
  });
});

describe('Recurring monthly cost total', () => {
  it('sums normalized monthly costs', () => {
    expect(
      totalMonthlyCost([
        { normalizedMonthlyCents: 1000 },
        { normalizedMonthlyCents: 2500 }
      ])
    ).toBe(3500);
  });

  it('returns 0 for empty input (empty state, no crash)', () => {
    expect(totalMonthlyCost([])).toBe(0);
    expect(totalMonthlyCost(null)).toBe(0);
  });
});

describe('Upcoming renewals (Test Case 12 — no invented window)', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('includes active subscriptions with future renewal dates, soonest first', () => {
    const subs = [
      { status: 'Active', renewalDate: '2026-12-01' },
      { status: 'Active', renewalDate: '2026-07-01' }
    ];
    const result = upcomingRenewals(subs, now);
    expect(result).toHaveLength(2);
    expect(result[0].renewalDate).toBe('2026-07-01');
  });

  it('excludes inactive and past-renewal subscriptions', () => {
    const subs = [
      { status: 'Inactive', renewalDate: '2026-12-01' },
      { status: 'Active', renewalDate: '2026-01-01' }
    ];
    expect(upcomingRenewals(subs, now)).toHaveLength(0);
  });

  it('returns empty for empty input', () => {
    expect(upcomingRenewals([], now)).toEqual([]);
    expect(upcomingRenewals(null, now)).toEqual([]);
  });
});
