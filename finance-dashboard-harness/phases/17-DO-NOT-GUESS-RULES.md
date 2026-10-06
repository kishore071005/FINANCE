# 17 — Do Not Guess Rules

The following items are currently **unspecified**.  
The agent must **not** silently invent a business rule for any of them.

- Authentication mechanism
- Authorization / role model
- Company currency
- Tax calculation rules
- Salary deduction rules
- Exact overdue calculation / transition rules
- Exact upcoming-payment time window
- Exact upcoming-renewal time window
- Payment methods allowed
- Expense status values
- Subscription status values
- Employment type values
- Department master-data source
- File / receipt storage mechanism
- Invoice uniqueness requirements
- Vendor contract storage mechanism
- Reporting export formats
- Pagination limits
- Date / timezone standard
- Audit logging requirements
- Data retention requirements
- Backup / recovery requirements
- UI design system / component library
- Charting library
- Exact API response contract
- Deployment configuration details

## Required Behavior When Encountering an Ambiguity

1. Identify the ambiguity.
2. Check existing project documentation / code for an approved answer.
3. If unavailable, flag it for human decision.
4. Use a clearly documented temporary implementation **only if** the project owner explicitly permits it.
