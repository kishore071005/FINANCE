# Expense Module — Required Test Cases

## Test Case 9 — Expense Category Summary

**Input**
```
SaaS = 10000
Marketing = 15000
Salaries = 50000
Operations = 5000
```

**Expected**
```
SaaS = 10000
Marketing = 15000
Salaries = 50000
Operations = 5000
Total = 80000
```

## Test Case 10 — Invalid Expense Amount

**Input**
```
Amount = invalid / non-numeric value
```

**Expected**
```
Request rejected with validation error.
```

## Additional Recommended Tests

- Creating expense with invalid category → rejected
- Empty expenses collection → empty state
- Category totals calculation
- Department totals calculation
