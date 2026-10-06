# Finance Overview Module — Requirements

## Purpose

Provide a high-level view answering:

> “How much money is coming in, where is the company spending money, and what payments are coming up?”

**Important**: Build this module **after** Revenue, Expenses, Salaries, Subscriptions, Domains, Vendors, and Budgets are working, because Overview aggregates them.

## Dashboard Must Display

- Total revenue
- Total expenses
- Net income
- Monthly revenue
- Monthly expenses
- Current month profit / loss
- Salary expenses
- SaaS expenses
- Operational expenses
- Marketing expenses
- Pending payments
- Upcoming payments

## Financial Calculation Rules (Minimum)

```
Net Income = Total Revenue − Total Expenses

Current Month Profit/Loss =
  Current Month Revenue − Current Month Expenses
```

Calculations must be centralized (service layer), not duplicated across UI components.

## Dashboard Behavior

- Summary KPI cards
- Revenue trend
- Expense trend
- Current financial position
- Expense category breakdown
- Upcoming / pending payment visibility
- Useful filtering by time period (where supported)

If a visualization type is not specified, choose a simple, readable visualization and document the choice.

## Backend

- Overview API (`/api/overview`)
- Overview service that aggregates data from other modules
- Optional Redis caching of summaries (with invalidation strategy)

## Frontend

- Overview dashboard page
- KPI cards
- Charts / trends
- Loading / empty / error states
