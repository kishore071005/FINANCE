# 10 — API Design Guidelines

The backend should expose clear module-based endpoints.

## Example Resource Areas

```text
/api/revenue
/api/expenses
/api/salaries
/api/subscriptions
/api/domains
/api/vendors
/api/budgets
/api/reports
/api/overview
```

These are structural examples only. Do not invent unsupported endpoints.

## For Each Endpoint Document

- HTTP method
- Path
- Request parameters / body
- Validation
- Response shape
- Error responses
- Authorization requirement (when authentication is defined)

## Consistency

Return consistent API response shapes across all modules.
