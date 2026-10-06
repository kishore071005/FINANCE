# API Documentation

## Base URL

`http://localhost:5000` (development)

## Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

For errors with validation details:

```json
{
  "success": false,
  "message": string,
  "errors": array | null
}
```

## Endpoints

### Health Check

**GET** `/api/health`

Returns the health status of the API and its services.

**Response:**
```json
{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "OK",
    "timestamp": "2026-10-05T...",
    "uptime": 123.45,
    "environment": "development",
    "services": {
      "database": "connected|disconnected",
      "redis": "connected|disconnected"
    }
  }
}
```

### Root

**GET** `/`

Returns API information.

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Finance Dashboard API",
  "data": {
    "name": "Finance Dashboard API"
  }
}
```

## Revenue Module

### Monetary Precision

Amounts are stored as integer minor units (`amountCents`, `taxCents`). The API
accepts major-unit decimals (e.g. `100.50`); the service converts them with
string parsing, never binary floating-point math. No currency is defined
(pending human decision) — no currency field, conversion, or tax calculation.

### List Invoices

**GET** `/api/revenue?paymentStatus=<status>&customer=<name>`

Both query params optional. `paymentStatus` must be one of
`Pending | Partially Paid | Paid | Overdue`.

### Create Invoice

**POST** `/api/revenue`

Body (JSON):

| Field | Required | Notes |
|---|---|---|
| customer | yes | non-empty string |
| invoiceNumber | yes | non-empty string (uniqueness NOT enforced — pending decision) |
| invoiceDate | yes | valid date |
| amount | yes | non-negative, max 2 decimals |
| tax | no | same amount rules |
| dueDate | no | valid date |
| paymentDate | no | valid date, recorded as provided |
| paymentStatus | no | one of the 4 statuses, defaults to `Pending` |

Success: `201` with the created invoice (amounts echoed in major units plus
`*Cents`). Validation failure: `400` with `errors` array.

### Get Invoice

**GET** `/api/revenue/:id` — `200`, or `404` when not found, `400` for malformed id.

### Update Invoice

**PATCH** `/api/revenue/:id` — partial update, same field rules as create.
`200`, `400` on validation failure, `404` when not found.

Note: status is stored exactly as submitted. No automatic
Pending → Overdue transition exists (exact rule undefined — pending decision).

## Expenses Module

### Allowed Categories (strict, 13)

Salaries, SaaS, Software, Domain, Hosting, Cloud, Hardware, Office,
Marketing, Travel, Operations, Professional services, Other.

### List Expenses

**GET** `/api/expenses?category=<cat>&department=<name>`

Both optional. `category` must be an allowed category; `department` is a
case-insensitive substring match.

### Expense Summary

**GET** `/api/expenses/summary`

```json
{
  "success": true,
  "data": {
    "byCategory": { "SaaS": 99.99 },
    "byCategoryCents": { "SaaS": 9999 },
    "byDepartment": { "Engineering": 99.99 },
    "byDepartmentCents": { "Engineering": 9999 },
    "total": 99.99,
    "totalCents": 9999,
    "count": 1
  }
}
```

### Create Expense

**POST** `/api/expenses`

Required: category (allowed list), description, amount (non-negative, max
2 decimals), date, vendor, department. Optional free-text (no enums —
harness leaves them undefined): paymentMethod, status, receipt, notes.
Success `201`, validation failure `400`.

### Get / Update Expense

**GET** `/api/expenses/:id`, **PATCH** `/api/expenses/:id` — same field rules.

## Salaries Module

### Money Model

Gross salary, deductions total, and net monthly cost, all in integer minor
units. Net = gross − deductions (provided totals only — no tax/payroll
computation). All amounts are MONTHLY figures; no period conversion.
Deductions may not exceed gross.

### List Salary Records

**GET** `/api/salaries?department=<name>&employee=<name>` — substring matches.

### Salary Summary

**GET** `/api/salaries/summary` — `{byDepartment, byDepartmentCents,
byEmployee, byEmployeeCents, totalMonthlyCost, totalMonthlyCostCents, count}`.

### Create Salary Record

**POST** `/api/salaries` — required: employee, salary (non-negative, max
2 decimals), department. Optional: deductions, employmentType,
paymentStatus, paymentDate, notes. Success `201`, failure `400`.

### Get / Update Salary Record

**GET** `/api/salaries/:id`, **PATCH** `/api/salaries/:id` — net is
recomputed whenever salary or deductions change.

## Subscriptions Module

### Normalization Formula (explicit)

Monthly → monthly cost = cost as-is. Annual → monthly cost =
round(annual cost / 12) in integer cents (nearest cent). An annual cost is
never treated as a monthly cost.

### List Subscriptions

**GET** `/api/subscriptions?status=&billingCycle=` — both optional filters.

### Subscription Summary

**GET** `/api/subscriptions/summary` — `{totalMonthly, totalMonthlyCents
(active only), activeCount, totalCount, upcomingRenewals}`. Upcoming =
Active with renewalDate ≥ today, soonest first, NO day-window cutoff
(window undefined — pending decision).

### Create Subscription

**POST** `/api/subscriptions` — required: serviceName, cost (non-negative,
max 2 decimals), billingCycle (Monthly/Annual), renewalDate. Optional:
provider, category, startDate, paymentMethod, owner, department, status
(Active/Inactive, default Active). Success `201`, failure `400`.

### Get / Update Subscription

**GET** `/api/subscriptions/:id`, **PATCH** `/api/subscriptions/:id` —
normalization recomputed when cost or cycle changes.

## Domains Module

### List Domain Records

**GET** `/api/domains?registrar=<name>` — optional substring filter.

### Domain Summary

**GET** `/api/domains/summary` — `{totalRenewalCost, totalRenewalCostCents,
totalHostingCost, totalHostingCostCents, count, upcomingRenewals}`.
Upcoming = renewalDate ≥ today, soonest first, NO day-window cutoff.

### Create Domain Record

**POST** `/api/domains` — required: domainName, registrar, renewalDate,
renewalCost (non-negative, max 2 decimals), hostingProvider, hostingCost.
Optional: purchaseDate, status (free-text). Success `201`, failure `400`.

### Get / Update Domain Record

**GET** `/api/domains/:id`, **PATCH** `/api/domains/:id`.

## Vendors Module

### Derivation Rule (single source of truth)

Total paid = sum of `Paid` payment records; pending = sum of `Pending`
records. Computed on every read in integer cents, never stored.

### List Vendors

**GET** `/api/vendors?name=` — optional substring filter. Each entry
includes derived `totalPaid`/`pendingAmount` (major + cents) and
`paymentCount`.

### Create Vendor

**POST** `/api/vendors` — required: name, contact, paymentTerms.
Optional: serviceProvided, contract (plain string reference).
Success `201`, failure `400`.

### Get / Update Vendor

**GET** `/api/vendors/:id` (includes full payment history),
**PATCH** `/api/vendors/:id`.

### Vendor Payments

**POST** `/api/vendors/:id/payments` — `{amount, status: Paid|Pending,
date?, reference?}` → `201` with updated vendor totals.
**GET** `/api/vendors/:id/payments` — payment history.

## Budgets Module

### Derivation Rule

actual(dept) = Σ expense amounts (case-insensitive department match)
+ Σ salary nets for the department. No period filtering (no budget period
defined). Remaining = budget − actual; overrun = remaining < 0. No alert
threshold — only negative remaining is flagged.

### List Budgets

**GET** `/api/budgets?department=` — optional strict-department filter.
Each entry carries budget, actualSpending (with expense/salary split),
remaining, and overrun flag (major + cents).

### Budget Summary

**GET** `/api/budgets/summary` — `{budgets, totalBudget, totalActual,
totalRemaining, overrunDepartments, count}`.

### Create Budget

**POST** `/api/budgets` — required: department (HR/Sales/Marketing/
Operations/Technology/Other), budget (non-negative, max 2 decimals).
Success `201`, failure `400`.

### Get / Update Budget

**GET** `/api/budgets/:id`, **PATCH** `/api/budgets/:id`.

## Financial Reports Module

### Single Source of Truth & No Contradictory Calculations
The reports module reuses the exact same calculation services and formulas established across individual modules and the Overview dashboard:
- **Revenue Report**: Paid revenue only (`totalRevenuePaid`), with status breakdowns and pending receivables.
- **Expense Report**: Category and department summaries using `totalsByCategory` and `totalsByDepartment`.
- **Salary Report**: Net monthly payroll costs and breakdowns using `salary.service.js`.
- **SaaS Expense Report**: SaaS expenses + active subscriptions monthly cost (identical to Overview).
- **Vendor Report**: Derived `totalPaid` and `totalPending` across vendor accounts.
- **Subscription Report**: Active normalized monthly costs (`normalizeMonthly`) and upcoming renewals.
- **Department Expense Report**: Combined view of departmental recorded expenses and salary payroll.
- **Monthly Profit / Loss**: Monthly paid revenue minus monthly total expenses (expenses + salaries + subscriptions).
- **Outstanding Payments**: Unpaid invoice receivables vs pending vendor payables.
- **Upcoming Payments**: Subscription renewals + domain renewals + pending vendor commitments.

### Get All Reports
**GET** `/api/reports`

Returns a composite report object containing all 10 reports and generation timestamp.

**Response:**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "generatedAt": "2026-10-06T...",
    "reports": {
      "revenue": { ... },
      "expenses": { ... },
      "salaries": { ... },
      "saas": { ... },
      "vendors": { ... },
      "subscriptions": { ... },
      "departments": { ... },
      "monthlyPL": { ... },
      "outstanding": { ... },
      "upcoming": { ... }
    }
  }
}
```

### Get Report By Type
**GET** `/api/reports/:type`

Retrieves an individual report by type slug.
Supported types: `revenue`, `expenses`, `salaries`, `saas`, `vendors`, `subscriptions`, `departments`, `monthly-pl`, `outstanding-payments`, `upcoming-payments`.

**Response (example: `/api/reports/revenue`):**
```json
{
  "success": true,
  "message": "Report 'revenue' retrieved successfully",
  "data": {
    "type": "revenue",
    "generatedAt": "2026-10-06T...",
    "data": {
      "totalRevenue": 5000,
      "totalRevenueCents": 500000,
      "pendingRevenue": 3500,
      "pendingRevenueCents": 350000,
      "totalCount": 3,
      "paidCount": 1,
      "unpaidCount": 2,
      "byStatus": { ... },
      "trend": [ ... ],
      "invoices": [ ... ]
    }
  }
}
```
If an invalid type is specified, returns `404 Not Found`.