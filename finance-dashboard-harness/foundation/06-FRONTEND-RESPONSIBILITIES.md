# 06 — Frontend Responsibilities

React frontend responsibilities:

- Display dashboard information.
- Fetch data through backend APIs.
- Render tables, cards, filters, charts, and reports.
- Handle loading states.
- Handle empty states.
- Handle API errors.
- Provide usable navigation.
- Validate appropriate user input before submission.
- Avoid embedding business calculations that belong in the backend/business layer.

## Technology Constraints

- Must be built using **React 19 + Vite**.
- Production output must be a **static frontend build** suitable for Nginx or Caddy.

## State Handling (Mandatory)

Every data-driven area must support:

1. Loading
2. Successful data
3. Empty data
4. Error

Do not leave blank screens while API requests are in progress.
