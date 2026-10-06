# 11 — Error Handling and UI States

## Errors the Application Must Handle

- Invalid input
- Missing required fields
- Invalid dates
- Invalid financial amounts
- Unknown status values
- Database failure
- Redis failure
- API failure
- Empty datasets
- Not found resources

## Frontend Requirements

- Display useful user-facing error states.
- Do not expose stack traces, database errors, secrets, or internal implementation details to normal users.

## Mandatory UI States

Every data-driven dashboard area must have an appropriate state for:

1. Loading
2. Successful data
3. Empty data
4. Error

Do not leave blank screens while API requests are in progress.
