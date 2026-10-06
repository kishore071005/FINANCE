# Domain / Hosting Management Module — Requirements

## Purpose

Track domains and associated hosting so that upcoming renewals and costs are visible.

## Fields to Track

- Domain name
- Registrar
- Purchase date
- Renewal date
- Renewal cost
- Hosting provider
- Hosting cost
- Status

## Requirements

- Make upcoming renewals visible where applicable.
- Exact upcoming-renewal time window is not defined — do not invent it.

## Backend

- Domains API (`/api/domains`)
- Domain service
- MongoDB domains collection

## Frontend

- Domains / Hosting page
- Renewal visibility
- Loading / empty / error states
