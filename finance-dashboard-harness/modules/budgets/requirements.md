# Budget Management Module — Requirements

## Purpose

Track departmental budgets, actual spending, and remaining budget.

## Departments

- HR
- Sales
- Marketing
- Operations
- Technology
- Other

## Track

- Budget
- Actual spending
- Remaining budget

## Budget Calculation

```
Remaining Budget = Budget - Actual Spending
```

The dashboard / reporting layer should make it easy to identify departments that are approaching or exceeding their budgets.

**Exact alert threshold is not specified.** Do not invent one without approval.

## Backend

- Budgets API (`/api/budgets`)
- Budget service (calculation of remaining)
- MongoDB budgets collection
- Actual spending should be derived from expenses + salaries where possible

## Frontend

- Budgets page
- Remaining budget display
- Clear indication of overrun
- Loading / empty / error states
