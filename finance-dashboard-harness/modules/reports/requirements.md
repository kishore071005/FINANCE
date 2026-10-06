# Financial Reports Module — Requirements

## Purpose

Provide the required financial reports using the **same underlying business rules and data sources** as the Overview dashboard.

**Important**: Build this module **last**, after all data modules and Overview are working.

## Required Reports

- Revenue report
- Expense report
- Salary report
- SaaS expense report
- Vendor report
- Subscription report
- Department expense report
- Monthly profit / loss
- Outstanding payments
- Upcoming payments

## Critical Rule

Do **not** implement separate, contradictory calculations for reports.  
Reports must reuse the same service-layer calculations used by Overview and the individual modules.

## Backend

- Reports API (`/api/reports`)
- Report service that reuses existing calculation logic
- Optional Redis caching for expensive reports

## Frontend

- Reports page / section
- Ability to view each required report
- Loading / empty / error states
