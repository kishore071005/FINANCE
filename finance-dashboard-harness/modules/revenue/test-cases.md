# Revenue Module — Required Test Cases

These test cases are extracted from the original harness and apply specifically to the Revenue module.

## Test Case 4 — Revenue Status

**Input**
```
Payment Status = Pending
```

**Expected**
```
Invoice is classified as pending.
```

Repeat equivalent validation for:

- Partially Paid
- Paid
- Overdue

Invalid statuses must be rejected.

---

## Test Case 10 — Invalid Expense Amount (adapted for Revenue)

**Input**
```
Amount = invalid / non-numeric value
```

**Expected**
```
Request rejected with validation error.
```

(Applies equally to revenue amount validation.)

---

## Test Case 11 — Missing Required Revenue Data

**Input**
```
Customer = missing
Invoice Number = INV-001
Amount = 10000
```

**Expected**
```
Request rejected because required customer data is missing.
```

The exact required-field rules must follow the finalized API / data model.

---

## Test Case 13 — Overdue Invoice

**Input**
```
Due Date = past date
Payment Date = not present
Status = unpaid / pending
```

**Expected**
```
Invoice is identified as overdue according to the final overdue business rule.
```

**Important**: The exact status transition rules must be finalized before implementation.  
Do not invent the overdue rule — flag it if undefined (see `foundation/17-DO-NOT-GUESS-RULES.md`).

---

## Additional Recommended Unit Tests for Revenue

- Creating an invoice with all required fields → success
- Creating an invoice with negative amount → validation error
- Updating payment status to an invalid value → validation error
- Recording a payment date when status becomes Paid
- Calculating total revenue from a set of Paid invoices
- Empty revenue collection → empty state (no crash)

---

## Edge Cases Specific to Revenue

- Zero amount invoice
- Missing payment date on a Paid invoice
- Duplicate invoice numbers (if uniqueness is required)
- Future due dates
- Very large amounts
