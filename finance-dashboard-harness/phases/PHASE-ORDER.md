# Recommended Build Order

This document defines the **safe sequential order** for implementing the Finance Dashboard.

Overview and Reports must come after the underlying data modules are working, because they depend on them.

## Phase 0 — Foundation (Do this first)

Before any functional module:

- Project setup (React 19 + Vite frontend, Node.js + Express backend)
- MongoDB Community Edition 7.x connection
- Redis 7 connection
- Environment configuration (`.env.example`)
- Folder structure (see `foundation/05-PROJECT-STRUCTURE.md`)
- API foundation (routing, consistent response shape, error middleware)
- Central error handling
- Loading / empty / error state patterns on frontend
- Testing setup (unit + integration skeleton)
- Basic health-check endpoints

**Deliverable**: A running empty shell that can serve static frontend and answer API health checks.

## Phase 1 — Revenue (Income)

```
Revenue
  ↓
Invoices
  ↓
Payments
  ↓
Statuses (Pending, Partially Paid, Paid, Overdue)
  ↓
Revenue calculations
  ↓
Tests
```

Load: `modules/revenue/*` + foundation files.

## Phase 2 — Expenses

```
Expenses
  ↓
Categories (strict list from harness)
  ↓
Vendors (basic link)
  ↓
Departments
  ↓
Payment information
  ↓
Tests
```

Load: `modules/expenses/*` + foundation files.

## Phase 3 — Salaries

```
Employees
  ↓
Salary / Stipend
  ↓
Deductions (do not invent rules)
  ↓
Department totals
  ↓
Employee totals
  ↓
Tests
```

Load: `modules/salaries/*` + foundation files.

## Phase 4 — Subscriptions (SaaS)

```
Subscriptions
  ↓
Billing cycle (monthly / annual)
  ↓
Monthly cost normalization
  ↓
Renewals
  ↓
Tests
```

Load: `modules/subscriptions/*` + foundation files.

## Phase 5 — Domains / Hosting

```
Domains
  ↓
Registrars
  ↓
Renewal dates & costs
  ↓
Hosting providers & costs
  ↓
Tests
```

Load: `modules/domains/*` + foundation files.

## Phase 6 — Vendors

```
Vendors
  ↓
Contact & payment terms
  ↓
Total paid / Pending amount (derived)
  ↓
Payment history
  ↓
Tests
```

Load: `modules/vendors/*` + foundation files.

## Phase 7 — Budgets

```
Departmental budgets
  ↓
Actual spending (from expenses + salaries)
  ↓
Remaining budget
  ↓
Overrun indication
  ↓
Tests
```

Load: `modules/budgets/*` + foundation files.

## Phase 8 — Finance Overview

**Important**: Build this only after Phases 1–7 are stable.

Overview depends on:

```
Revenue ────────┐
Expenses ───────┤
Salaries ───────┤
Subscriptions ──┤
Payments ───────┤
                ↓
        Finance Overview
```

Load: `modules/overview/*` + all previous module requirements (summary) + foundation.

## Phase 9 — Reports

Reports depend on **all** underlying financial data.

```
Revenue
Expenses
Salaries
Subscriptions
Vendors
Budgets
      ↓
   Reports
```

Load: `modules/reports/*` + foundation.

## Dependency Rule

Never implement Overview or Reports before the modules they aggregate are complete and tested.

## After Each Phase

1. Run the module’s test cases.
2. Verify build succeeds.
3. Confirm no invented business rules were introduced.
4. Update documentation if needed.
5. Only then proceed to the next phase.
