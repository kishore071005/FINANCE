# Expense Management Module — Requirements

## Purpose

Track all company expenses with categorization, vendor linkage, and departmental attribution.

## Fields to Track

- Expense ID
- Category
- Description
- Amount
- Date
- Vendor
- Payment method
- Department
- Receipt / invoice
- Status
- Notes

## Allowed Expense Categories (Strict)

- Salaries
- SaaS
- Software
- Domain
- Hosting
- Cloud
- Hardware
- Office
- Marketing
- Travel
- Operations
- Professional services
- Other

**Do not** silently invent additional categories.  
If a future category is needed, it must be explicitly added to the requirements.

## Backend

- Expense API (`/api/expenses`)
- Expense service + validation
- MongoDB expenses collection

## Frontend

- Expense page / table
- Category filters
- Department filters
- Loading / empty / error states

## Business Rules

- Amount must be a valid non-negative financial amount
- Category must be one of the allowed values
- Financial calculations (totals by category, by department) must live in the service layer

## Related Global Rules

See `foundation/17-DO-NOT-GUESS-RULES.md` for undefined items (expense status values, payment methods, receipt storage, etc.).
