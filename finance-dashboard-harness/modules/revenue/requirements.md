# Revenue Module — Requirements

## Purpose

Track customer invoices and incoming payments (company income / revenue).

This module answers:
- Which invoices exist?
- What is their payment status?
- How much revenue has been received?
- Which invoices are pending or overdue?

## Fields to Track

| Field            | Description                                      | Notes                                      |
|------------------|--------------------------------------------------|--------------------------------------------|
| Customer         | Name or identifier of the customer               | Required                                   |
| Invoice Number   | Unique identifier of the invoice                 | Should identify an invoice                 |
| Invoice Date     | Date the invoice was issued                      | Required                                   |
| Amount           | Invoice amount                                   | Must be valid non-negative financial amount|
| Tax              | Tax amount (where applicable)                    | Optional / as applicable                   |
| Payment Due Date | Date payment is due                              | Must be handled consistently               |
| Payment Date     | Date payment was received                        | Recorded when payment occurs               |
| Payment Status   | Current status of the invoice                    | Strict enum (see below)                    |

## Allowed Payment Statuses

- `Pending`
- `Partially Paid`
- `Paid`
- `Overdue`

Invalid statuses must be rejected by validation.

## Revenue Rules

1. Invoice number should identify an invoice.
2. Amount must be validated as a valid non-negative financial amount (unless business rules explicitly allow otherwise).
3. Payment status must use only the defined status values.
4. Payment date should be recorded when payment occurs.
5. Due date must be handled consistently.
6. Overdue logic must be based on the defined due date and payment status.
7. Financial amounts must not use unsafe floating-point calculations where exact monetary precision is required. Use an appropriate monetary representation and document it.

## Backend Responsibilities

- Revenue API endpoints (under `/api/revenue` or equivalent)
- Revenue service layer (business logic + calculations)
- Revenue validation (input validation at API boundary)
- MongoDB revenue / invoices collection
- Consistent API response shape
- Error handling for invalid input, missing fields, unknown statuses, etc.

## Frontend Responsibilities

- Revenue page
- Revenue table / list
- Filters (status, date range, customer, etc. as supported)
- Status indicators (visual distinction for Pending / Partially Paid / Paid / Overdue)
- Loading, empty, and error states
- Form for creating / editing invoices (with client-side validation before submission)
- **Do not** embed business calculations that belong in the backend

## Data Flow

```
Frontend (Revenue page)
    ↓ HTTP/JSON
Express API (/api/revenue)
    ↓
Revenue Service (validation + business rules)
    ↓
MongoDB (revenue/invoices collection)
```

Redis may be used for caching frequently requested revenue summaries, with a clear invalidation strategy.

## Monetary Precision

Document the chosen monetary representation (e.g. integer cents, Decimal library, etc.).  
Do not rely on native floating-point arithmetic for money.

## Related Global Rules

- See `foundation/17-DO-NOT-GUESS-RULES.md` for items that must not be invented (currency, exact overdue transition rules, tax rules, invoice uniqueness requirements, etc.).
- Follow the AI Agent Workflow in `foundation/16-AI-AGENT-WORKFLOW.md`.
