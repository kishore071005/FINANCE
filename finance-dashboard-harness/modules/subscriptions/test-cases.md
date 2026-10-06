# Subscriptions Module — Required Test Cases

## Test Case 12 — Upcoming Subscription Renewal

**Input**
```
Subscription:
  Renewal Date = future date
  Status = active
```

**Expected**
```
Subscription appears in upcoming renewals according to the defined dashboard time window.
```

**Important**: The exact number of days for “upcoming” is not defined.  
Do not invent the window — flag it if undefined.

## Additional Recommended Tests

- Monthly vs annual cost conversion (documented formula)
- Active vs inactive status handling
- Empty subscriptions → empty state
