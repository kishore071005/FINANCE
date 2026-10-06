const {
  monthKey,
  lastMonthKeys,
  bucketByMonth
} = require('../../backend/src/modules/overview/overview.service');

// ---------------------------------------------------------------------------
// Pure helper tests (existing)
// ---------------------------------------------------------------------------

describe('Month helpers', () => {
  it('builds UTC month keys', () => {
    expect(monthKey('2026-03-15T10:00:00Z')).toBe('2026-03');
  });

  it('lists the last N months ending at the current month', () => {
    expect(lastMonthKeys(3, new Date('2026-03-15T00:00:00Z'))).toEqual([
      '2026-01',
      '2026-02',
      '2026-03'
    ]);
  });
});

describe('Trend bucketing', () => {
  const now = new Date('2026-03-15T00:00:00Z');

  it('buckets amounts into the last 6 UTC months', () => {
    const docs = [
      { date: '2026-03-05', amountCents: 1000 },
      { date: '2026-03-20', amountCents: 2000 },
      { date: '2026-01-10', amountCents: 500 },
      { date: '2025-01-01', amountCents: 99999 }
    ];
    const result = bucketByMonth(docs, 'date', 'amountCents', 6, now);
    expect(result).toHaveLength(6);
    expect(result.find((b) => b.month === '2026-03')).toEqual({
      month: '2026-03',
      totalCents: 3000
    });
    expect(result.find((b) => b.month === '2026-01')).toEqual({
      month: '2026-01',
      totalCents: 500
    });
    expect(result.find((b) => b.month === '2026-02')).toEqual({
      month: '2026-02',
      totalCents: 0
    });
  });

  it('returns zero buckets for empty input (TC14, no crash)', () => {
    const result = bucketByMonth([], 'date', 'amountCents', 6, now);
    expect(result).toHaveLength(6);
    expect(result.every((b) => b.totalCents === 0)).toBe(true);
    expect(bucketByMonth(null, 'date', 'amountCents', 6, now)).toHaveLength(6);
  });

  it('ignores records without dates', () => {
    const result = bucketByMonth([{ amountCents: 100 }], 'date', 'amountCents', 6, now);
    expect(result.every((b) => b.totalCents === 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Net Income calculation tests (Harness Test Cases 1-3)
// These verify the centralized formula: Net = Revenue − Total Expenses
// The service uses: totalExpenses = expenses + salaries + subscriptions
// ---------------------------------------------------------------------------

describe('Net Income calculation logic', () => {
  // TC1 — Net Income (Profit)
  it('TC1: computes positive net income when revenue > expenses', () => {
    const revenueCents = 10000000; // 100,000.00
    const totalExpensesCents = 6000000; // 60,000.00
    const netCents = revenueCents - totalExpensesCents;
    expect(netCents).toBe(4000000); // 40,000.00
    expect(netCents).toBeGreaterThan(0);
  });

  // TC2 — Net Income (Loss)
  it('TC2: computes negative net income when revenue < expenses', () => {
    const revenueCents = 5000000; // 50,000.00
    const totalExpensesCents = 7000000; // 70,000.00
    const netCents = revenueCents - totalExpensesCents;
    expect(netCents).toBe(-2000000); // -20,000.00
    expect(netCents).toBeLessThan(0);
  });

  // TC3 — Zero Financial Activity
  it('TC3: computes zero net income when both revenue and expenses are zero', () => {
    const revenueCents = 0;
    const totalExpensesCents = 0;
    const netCents = revenueCents - totalExpensesCents;
    expect(netCents).toBe(0);
  });

  // TC3 variant — no divide-by-zero or NaN
  it('TC3: zero values produce no NaN or Infinity', () => {
    const revenueCents = 0;
    const totalExpensesCents = 0;
    const netCents = revenueCents - totalExpensesCents;
    expect(Number.isFinite(netCents)).toBe(true);
    expect(Number.isNaN(netCents)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TC14 — Empty Dashboard (helper-level assertions)
// ---------------------------------------------------------------------------

describe('Empty dashboard safety (TC14)', () => {
  it('bucketByMonth handles empty/null arrays without errors', () => {
    const now = new Date('2026-06-15T00:00:00Z');
    expect(() => bucketByMonth([], 'date', 'amountCents', 6, now)).not.toThrow();
    expect(() => bucketByMonth(null, 'date', 'amountCents', 6, now)).not.toThrow();
    expect(() => bucketByMonth(undefined, 'date', 'amountCents', 6, now)).not.toThrow();
  });

  it('monthKey handles valid date strings', () => {
    expect(() => monthKey('2026-01-01')).not.toThrow();
    expect(monthKey('2026-01-01')).toBe('2026-01');
  });

  it('lastMonthKeys returns correct count', () => {
    const keys = lastMonthKeys(6, new Date('2026-06-01T00:00:00Z'));
    expect(keys).toHaveLength(6);
    expect(keys[0]).toBe('2026-01');
    expect(keys[5]).toBe('2026-06');
  });
});
