const {
  toMinorUnits,
  toMajorUnits,
  totalRenewalCost,
  totalHostingCost,
  upcomingRenewals
} = require('../../backend/src/modules/domains/domain.service');

describe('Domain cost precision (integer minor units)', () => {
  it('converts costs to cents without float error', () => {
    expect(toMinorUnits(12.99)).toBe(1299);
    expect(toMinorUnits('5.00')).toBe(500);
    expect(toMajorUnits(1299)).toBe(12.99);
  });
});

describe('Domain cost totals', () => {
  const domains = [
    { renewalCostCents: 1299, hostingCostCents: 2000 },
    { renewalCostCents: 999, hostingCostCents: 0 }
  ];

  it('sums renewal costs', () => {
    expect(totalRenewalCost(domains)).toBe(2298);
  });

  it('sums hosting costs', () => {
    expect(totalHostingCost(domains)).toBe(2000);
  });

  it('returns 0 for empty input (empty state, no crash)', () => {
    expect(totalRenewalCost([])).toBe(0);
    expect(totalRenewalCost(null)).toBe(0);
    expect(totalHostingCost([])).toBe(0);
    expect(totalHostingCost(null)).toBe(0);
  });
});

describe('Domain upcoming renewals (no invented window)', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('lists renewals today or later, soonest first', () => {
    const domains = [
      { domainName: 'b.com', renewalDate: '2026-12-01' },
      { domainName: 'a.com', renewalDate: '2026-07-01' }
    ];
    const result = upcomingRenewals(domains, now);
    expect(result).toHaveLength(2);
    expect(result[0].domainName).toBe('a.com');
  });

  it('excludes past renewals', () => {
    expect(
      upcomingRenewals([{ domainName: 'old.com', renewalDate: '2026-01-01' }], now)
    ).toHaveLength(0);
  });

  it('returns empty for empty input', () => {
    expect(upcomingRenewals([], now)).toEqual([]);
    expect(upcomingRenewals(null, now)).toEqual([]);
  });
});
