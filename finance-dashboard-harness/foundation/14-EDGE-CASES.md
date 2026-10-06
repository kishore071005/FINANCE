# 14 — Edge Cases

The agent must consider at least the following:

- Empty collections
- Zero amounts
- Negative calculated profit / loss
- Large financial values
- Invalid amounts
- Missing dates
- Invalid dates
- Duplicate invoice numbers (where uniqueness is required)
- Duplicate expense IDs (where uniqueness is required)
- Invalid payment status
- Subscription with annual billing
- Subscription with monthly billing
- Expired / overdue payments
- Future payments
- Budget overrun
- API timeout / failure
- MongoDB unavailable
- Redis unavailable
- Partial data
- Missing vendor
- Missing receipt / invoice
- Missing payment date
- Missing deductions
