# 08 — Database Guidelines

MongoDB Community Edition 7.x is **mandatory**.

## Likely Domain Collections

- revenue / invoices
- expenses
- employees / salaries
- subscriptions
- domains
- vendors
- budgets
- payments or payment history (where required)

The exact schema must be finalized from the business requirements and any existing system conventions.

## Rules

- Do not create duplicate fields simply because they make UI development easier.
- For every financial field, document:
  - Meaning
  - Unit / currency
  - Whether it is calculated or stored
  - Source of truth

MongoDB remains the **persistent source of truth**. Redis must never be treated as the permanent source of truth for financial records.
