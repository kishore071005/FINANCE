# 02 — Strict Technology Stack

These technologies are **mandatory**. Do not replace any of them without explicit human approval.

## Frontend

- React 19
- Vite
- Static build output
- Served as static HTML/JS/CSS through Nginx or Caddy

## Backend

- Node.js
- Express
- API server
- Deployment through PM2 or Docker

## Database

- MongoDB Community Edition 7.x

## Cache / Queues

- Redis 7

## Strict Stack Rules

1. Do not replace React with another frontend framework.
2. Do not replace Vite with another frontend build tool.
3. Do not replace Express with another backend framework.
4. Do not replace MongoDB with SQL, PostgreSQL, MySQL, Firebase, Supabase, or another database.
5. Do not replace Redis with another cache or queue technology.
6. Do not introduce another backend language.
7. Do not introduce another frontend framework.
8. Do not migrate the application to Next.js.
9. Do not add unnecessary infrastructure.
10. Do not change the required stack without explicit human approval.
11. Prefer existing project dependencies and patterns over introducing new dependencies.
12. If a dependency is required but not specified, document the reason before introducing it.
13. Do not silently make architectural decisions that contradict this harness.
