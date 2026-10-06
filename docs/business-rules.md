# Business Rules

## Foundation Rules

This document will be populated as business modules are implemented. For Phase 0 (Foundation), the following constraints apply:

- Do NOT implement any business modules (Revenue, Expenses, Salaries, etc.)
- Do NOT invent authentication
- Do NOT invent currency, tax rules, or any business logic
- Do NOT change the technology stack
- All configuration from environment variables
- Monetary values must use safe precision (to be documented per module)
- Business logic stays in the service layer
- Validation happens on the backend
- Financial calculations happen on the backend

## Revenue Rules (Phase 1)

- Allowed payment statuses (strict): Pending, Partially Paid, Paid, Overdue.
- Customer, Invoice Number, Invoice Date, Amount are required.
- Amounts non-negative, max 2 decimals; stored as integer minor units (cents).
- Status is stored as submitted — no automatic overdue transition.
- Tax stored as provided; no tax calculation. No currency handling.

## Decisions Needed From Human

- Exact overdue transition rule (Test Case 13 cannot be fully implemented).
- Currency / minor-unit scale confirmation (cents assumed).
- Invoice-number uniqueness requirement (currently no unique index).
- Whether Paid status requires a payment date (currently optional).
- Tax applicability rules.

## Expense Rules (Phase 2)

- Allowed categories (strict, 13): Salaries, SaaS, Software, Domain, Hosting,
  Cloud, Hardware, Office, Marketing, Travel, Operations,
  Professional services, Other.
- Required: category, description, amount, date, vendor, department.
- Amounts non-negative, max 2 decimals; stored as integer minor units.
- Status, payment method, receipt: optional free-text (values undefined by
  harness — no enums enforced). Vendor is a basic string link (Phase 6 owns
  full vendor records).

## Decisions Needed From Human (Expenses)

- Expense status value set (currently free-text).
- Payment method value set (currently free-text).
- Receipt storage mechanism (currently plain string reference).
- Department master-data source (currently free-text).
- Whether vendor/department should be optional instead of required.
- Currency — cents assumed, consistent with Revenue.

## Salary Rules (Phase 3)

- Required: employee, salary/stipend, department. Optional: deductions,
  employment type, payment status/date, notes.
- Net monthly cost = gross − provided deductions total (integer cents).
- Deductions may not exceed gross (integrity rule, flagged below).
- All amounts are monthly figures; no annualization.
- Employment type and payment status: free-text (values undefined).

## Decisions Needed From Human (Salaries)

- Salary deduction rules / tax / payroll computation (none implemented).
- Employment type value set (currently free-text).
- Salary payment status value set (currently free-text).
- Confirm deductions-cannot-exceed-gross rejection is acceptable.
- Confirm monthly-figures interpretation of salary amounts.

## Subscription Rules (Phase 4)

- Required: serviceName, cost, billingCycle (Monthly/Annual), renewalDate.
- Normalization: Monthly as-is; Annual round(cost/12) cents.
- Status Active/Inactive (values per test-cases — flagged below).
- Upcoming renewals surfaced with no day-window cutoff.
- Summary monthly total covers Active subscriptions only.

## Decisions Needed From Human (Subscriptions)

- Subscription status value set confirmation (Active/Inactive inferred).
- Exact upcoming-renewal time window (Test Case 12 not fully implementable).
- Rounding rule for uneven annual amounts (nearest cent assumed).
- Whether summary total should include Inactive subscriptions.

## Domain Rules (Phase 5)

- Required: domainName, registrar, renewalDate, renewalCost,
  hostingProvider, hostingCost. Optional: purchaseDate, status (free-text).
- Costs as integer minor units; no renewal window cutoff.

## Decisions Needed From Human (Domains)

- Confirm hosting provider/cost should stay required for every domain
  (alternative: optional associated hosting).
- Domain status value set (currently free-text).
- Exact upcoming-renewal time window (currently no cutoff).

## Vendor Rules (Phase 6)

- Required: name, contact, paymentTerms. Optional: serviceProvided,
  contract (string reference).
- Payment statuses Paid/Pending mirror the requirements field names.
- Totals derived from payment records on every read; nothing stored.

## Decisions Needed From Human (Vendors)

- Vendor payment status value set confirmation (Paid/Pending inferred).
- Contract storage mechanism (currently plain string reference).
- Vendor-name uniqueness (currently no unique index).
- Whether expense records should link to vendor IDs (currently only
  free-text vendor names in Phase 2).

## Budget Rules (Phase 7)

- Departments strict: HR, Sales, Marketing, Operations, Technology, Other.
- Required: department, budget. Actual derived from expenses + salaries.
- Overrun = remaining < 0 only; no approaching-budget threshold.
- No budget period; no date filtering on actuals.

## Decisions Needed From Human (Budgets)

- Budget period definition (currently all-time actuals; salary nets are
  monthly figures mixed with all-time expenses).
- One-budget-per-department enforcement (currently not enforced).
- Department master-data alignment (expenses/salaries use free-text;
  non-matching names like "Engineering" never match a budget).
- Alert threshold for approaching budgets (none built).