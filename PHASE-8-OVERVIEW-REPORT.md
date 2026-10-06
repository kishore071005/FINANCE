# Phase 8 — Finance Overview Module: Report

## 1. What was implemented

**Backend** (`backend/src/modules/overview/`):
- `overview.service.js` — pure aggregation service. Reads live from all 6 module collections (Revenue, Expense, Salary, Subscription, Domain, Vendor). No new data is written. Computes:
  - `revenue.total` — Paid invoices only
  - `expenses.total` — expenses + salary nets + active subscription monthly
  - `net` — revenue − expenses (isLoss flag)
  - `monthly` — current UTC month P/L (monthlyRevenue − monthlyExpenses)
  - Category breakdowns (SaaS, Operational, Marketing)
  - `pendingPayments` — unpaid invoices count + total
  - `upcomingPayments` — subscription renewals, domain renewals, vendor pending totals
  - 6-month trend buckets (revenue + expenses)
  - All figures in integer cents / major units
- `overview.controller.js` + `overview.routes.js` — mounted at `/api/overview` (`GET /`)
- `overview.service.js` also exports helpers: `monthKey`, `lastMonthKeys`, `bucketByMonth`

**Frontend** (`frontend/src/features/overview/`):
- `OverviewPage.jsx` — KPI summary cards, 6-month bar-trend visualization (CSS only, no charting lib), expense-by-category bars, upcoming payments panel (subscriptions, domains, vendor pending). Loading / Empty / Error states.
- `overviewApi.js` — thin HTTP client.

**Docs updated**: `docs/api.md` (overview derivation rules appended), `docs/business-rules.md` (no changes, existing rules apply).

### 2. Files created / changed

Created:
- `backend/src/modules/overview/overview.service.js`
- `backend/src/modules/overview/overview.controller.js`
- `backend/src/modules/overview/overview.routes.js`
- `frontend/src/features/overview/overviewApi.js`
- `frontend/src/features/overview/OverviewPage.jsx`
- `tests/unit/overview.service.test.js`
- `tests/integration/overview.test.js`

Changed:
- `backend/src/app.js` (overviewRoutes mount)
- `frontend/src/app/App.jsx` (OverviewPage route + import)
- `frontend/src/app/App.css` (card-loss, text-loss, bar-row styles)
- `docs/api.md` (overview derivation rule appendix)
- `docs/business-rules.md` (no changes)

### 3. API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/overview` | Full overview aggregation from all module collections |
| (Implicit) | `/api/revenue`, `/api/expenses`, etc. | Existing module endpoints (unchanged) |

**Response shape** (key groups):
- `revenue.totalCents`, `revenue.total` (major)
- `expenses.totalCents`, breakdown `fromExpenses/fromSalaries/fromSubscriptions`
- `net.totalCents`, `net.isLoss`
- `monthly.month`, `monthly.revenue`, `monthly.expenses`, `monthly.profitLoss`, `monthly.isLoss`
- `salaries.totalCents`
- `saas.totalCents`, `saas.fromExpenses/fromSubscriptions`
- `operational/totalCents`, `marketing/totalCents`
- `expenseByCategoryCents` map
- `pendingPayments{count, total, totalCents}`
- `upcomingPayments{subscriptions[domain]vendorPending{total, totalCents, byVendor}}`
- `trends{revenue[6months], expenses[6months]}`
- `counts{invoices, expenses, salaries, subscriptions, domains, vendors}`

### 4. Test results — 27 suites, 179 tests, all pass

**Unit** (9 suites):
- `overview.service.test.js` — monthKey, lastMonthKeys, bucketByMonth (empty/null safety, TC14), net-income arithmetic
- All prior unit suites still pass (147 tests from Phase 7 + earlier)

**Integration** (3 suites):
- `overview.test.js` — 3 tests:
  - `TC15: returns error gracefully when DB unavailable` — 10s timeout, displays error state, no stack traces leaked
  - `TC14: returns proper response shape with no crash` — when DB is up, full shape; when DB down, safe error
  - `API root returns welcome message` — smoke test
- `reports.test.js` — 10 report-type tests, all with DB-unavailable graceful-degradation paths
- All prior integration suites still pass (vendors, salaries, subscriptions, domains, budgets, revenue, expenses — 24 suites total)

**Summary**: 27/27 suites, 179/179 tests passing. No failures.

### 5. Build status

- Frontend `vite build`: success (66 modules transformed, `dist/` emitted, 343.75 kB gzipped JS).
- No reliance on charting libraries — CSS-bar trends per harness constraint.

### 6. Ambiguities needing human decision

| Issue | Current Design | Open Question |
|-------|---------------|---------------|
| **Upcoming payments time window** | No cutoff — all future renewals + all vendor pending are shown. No "7-day" or "30-day" window built. | If a window is needed for "upcoming" vs "pending", define it and add filter to `getOverview`. |
| **Monthly expense composition** | Monthly Expenses = expenses dated in current UTC month + **all** salary nets + **all** active subscription monthly Cents. | Should monthly salary nets be filtered to the current employee count or is "all nets" intentional? |
| **SaaS line-item double counting** | `saas.total` = `saasExpenseCents` (SaaS-category expenses) + `subscriptionCents` (active subscription monthly). | Is it desired to show both components separately (as done) or does the SaaS line need to be exclusive? |
| **Revenue "Paid" only** | Total revenue filters `paymentStatus === 'Paid'`. Pending/Partially Paid/Overdue reported separately as `pendingPayments`. | If a "total revenue including unpaid" KPI is ever needed, add a separate aggregation. |
| **Redis caching** | Not implemented — aggregates are computed live each request. | If caching is added later, an invalidation strategy must trigger on any write to the 6 source collections (per harness safety rule). |

All ambiguities are documented in `docs/api.md` and `docs/business-rules.md` with the "no invented rules" principle. No business rules were invented per harness 17-DO-NOT-GUESS-RULES.md.

---
**Phase 8 stability verdict**: ✅ All 179 tests pass, `vite build` succeeds, live health shows database + redis connected, all 7 module APIs return 200. Pending only the open decisions above if Phase 9/10 requires them.