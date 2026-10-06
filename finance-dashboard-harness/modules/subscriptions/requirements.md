# SaaS & Subscription Management Module — Requirements

## Purpose

Track recurring company subscriptions and make upcoming renewals and monthly costs visible.

## Example Services

Google Workspace, Microsoft, GitHub, AWS, Azure, Vercel, Domain, Hosting, Figma, Notion, AI APIs, Other SaaS services.

## Fields to Track

- Service name
- Provider
- Category
- Monthly / annual cost
- Billing cycle
- Start date
- Renewal date
- Payment method
- Owner / department
- Status

## Dashboard Requirements

- Upcoming renewals
- Recurring monthly costs

## Important Rules

- Normalize recurring cost information sufficiently to support monthly reporting.
- Do **not** assume an annual cost is the same as monthly cost.
- Convert only through an explicit, documented calculation.
- Exact upcoming-renewal time window is **not defined** — do not invent it.

## Backend

- Subscriptions API (`/api/subscriptions`)
- Subscription service (including cost normalization)
- MongoDB subscriptions collection

## Frontend

- Subscriptions page
- Upcoming renewals view
- Monthly cost summary
- Loading / empty / error states
