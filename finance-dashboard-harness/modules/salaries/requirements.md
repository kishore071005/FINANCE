# Employee Salary Management Module — Requirements

## Purpose

Track employee salaries / stipends, departmental costs, and payment status.

## Fields to Track

- Employee
- Salary / stipend
- Department
- Employment type
- Monthly salary cost
- Payment status
- Payment date
- Applicable deductions
- Notes

## Required Capabilities

- Total monthly salary cost
- Department-wise salary cost
- Employee-wise salary cost

## Salary Rules

- Salary calculations must be implemented in a centralized business / service layer.
- The system must distinguish between:
  - Gross salary / stipend
  - Applicable deductions
  - Actual payment / cost
- The exact deduction rules are **not specified**.  
  **Do not invent tax or payroll rules.**

## Backend

- Salaries API (`/api/salaries`)
- Salary service (centralized calculations)
- MongoDB employees / salaries collection

## Frontend

- Salary / employee page
- Department and employee summaries
- Loading / empty / error states
