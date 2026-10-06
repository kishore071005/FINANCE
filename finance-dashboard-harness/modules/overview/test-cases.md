# Overview Module — Required Test Cases

## Test Case 1 — Net Income

**Input**
```
Revenue = 100000
Expenses = 60000
```

**Expected**
```
Net Income = 40000
```

## Test Case 2 — Loss

**Input**
```
Revenue = 50000
Expenses = 70000
```

**Expected**
```
Net Income = -20000
```

The UI must represent a loss clearly.

## Test Case 3 — Zero Financial Activity

**Input**
```
Revenue = 0
Expenses = 0
```

**Expected**
```
Net Income = 0
```

No divide-by-zero or rendering errors.

## Test Case 14 — Empty Dashboard

**Input**
```
No revenue
No expenses
No salaries
No subscriptions
No vendors
```

**Expected**
```
Dashboard loads successfully.
No-data / empty states are displayed.
No JavaScript errors occur.
```

## Test Case 15 — Backend Failure

Simulate database / API failure.

**Expected**
```
Frontend displays an appropriate error state.
Application does not crash.
Sensitive internal error details are not exposed.
```
