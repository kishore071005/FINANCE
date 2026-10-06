# Revenue Module — Acceptance Criteria

A Revenue feature is complete only when **all** of the following are true:

## Requirements Coverage

- [ ] All required fields are supported (Customer, Invoice Number, Invoice Date, Amount, Tax, Due Date, Payment Date, Payment Status)
- [ ] Only the four allowed statuses are accepted: Pending, Partially Paid, Paid, Overdue
- [ ] Invalid statuses are rejected
- [ ] Amount validation rejects non-numeric and negative values (unless explicitly allowed)
- [ ] Missing required fields (especially Customer) are rejected

## Backend

- [ ] Revenue API endpoints exist and follow the module-based design
- [ ] Input validation occurs at the API boundary
- [ ] Business logic lives in the service layer
- [ ] MongoDB collection is used as the source of truth
- [ ] Consistent API response shape is returned
- [ ] Errors do not expose internal details

## Frontend

- [ ] Revenue page exists
- [ ] Table / list of invoices is displayed
- [ ] Status indicators are clear
- [ ] Loading state is shown while fetching
- [ ] Empty state is shown when no invoices exist
- [ ] Error state is shown on API failure
- [ ] No business calculations are hard-coded in UI components

## Testing

- [ ] Unit tests for status validation pass
- [ ] Unit tests for amount validation pass
- [ ] Unit tests for missing required fields pass
- [ ] Integration tests for create / read / update flow pass (where applicable)
- [ ] Build succeeds

## Safety & Principles

- [ ] No secrets committed
- [ ] No direct frontend → MongoDB access
- [ ] Monetary precision is documented
- [ ] No invented business rules (overdue logic, tax, uniqueness, currency, etc.)

## Definition of Done Checklist

```
Requirement understood
        ↓
Architecture planned
        ↓
Backend / data model implemented
        ↓
Frontend implemented
        ↓
Validation implemented
        ↓
Loading / error / empty states handled
        ↓
Business logic tested
        ↓
Integration tested where required
        ↓
Build succeeds
        ↓
Implementation reviewed against requirements
```
