# Vendor Management Module — Requirements

## Purpose

Maintain vendor information and derive financial summaries consistently from payment / transaction data.

## Fields to Maintain

- Vendor name
- Contact
- Service provided
- Payment terms
- Contract
- Total paid
- Pending amount
- Payment history

## Critical Rule

Vendor financial summaries must be derived consistently from payment / transaction data where applicable.

**Avoid** maintaining multiple conflicting sources of truth for the same financial amount.

## Backend

- Vendors API (`/api/vendors`)
- Vendor service (derived totals)
- MongoDB vendors collection (+ payment history if needed)

## Frontend

- Vendors page
- Total paid / pending amount display
- Loading / empty / error states
