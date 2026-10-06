# 05 — Recommended Project Structure

Use this as the default structure unless the existing repository already has an established and approved structure.

```text
finance-dashboard/
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── overview/
│   │   │   ├── revenue/
│   │   │   ├── expenses/
│   │   │   ├── salaries/
│   │   │   ├── subscriptions/
│   │   │   ├── domains/
│   │   │   ├── vendors/
│   │   │   ├── budgets/
│   │   │   └── reports/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── app/
│   ├── public/
│   └── vite.config.*
|
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── overview/
│   │   │   ├── revenue/
│   │   │   ├── expenses/
│   │   │   ├── salaries/
│   │   │   ├── subscriptions/
│   │   │   ├── domains/
│   │   │   ├── vendors/
│   │   │   ├── budgets/
│   │   │   └── reports/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── database/
│   │   ├── cache/
│   │   ├── queues/
│   │   ├── utils/
│   │   └── app.*
│   └── package.json
|
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
|
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── business-rules.md
|
├── .env.example
├── README.md
└── AGENTS.md
```

**Important**: Inspect the existing repository before creating this structure. Adapt to any already-approved structure instead of blindly replacing it.
