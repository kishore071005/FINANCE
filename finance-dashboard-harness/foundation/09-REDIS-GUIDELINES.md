# 09 — Redis Guidelines

Redis 7 may be used for:

- Frequently requested dashboard summaries
- Expensive report caching
- Upcoming payment / renewal cache
- Background job queues where required

## Rules

- Do not cache everything by default.
- Any cached financial data must have a clear invalidation / update strategy.
- Never treat Redis as the permanent source of truth for financial records.
- MongoDB remains the persistent data source.
