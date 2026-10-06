# 15 — Global Acceptance Criteria

The implementation is accepted only when:

### Requirements

- All nine functional modules are implemented or explicitly marked as pending with approval.
- Required finance fields are supported.
- Required statuses and categories are enforced.
- Required reports are available.

### Technology

- React 19 is used.
- Vite is used.
- Frontend produces a static build.
- Express is used for the backend.
- Node.js is used.
- MongoDB Community Edition 7.x is used.
- Redis 7 is used where caching / queues are required.
- Nginx or Caddy can serve the frontend build.
- PM2 or Docker can run the backend.

### Quality

- Business calculations are testable.
- API input is validated.
- Loading, empty, and error states exist.
- No secrets are committed.
- No direct frontend-to-database connection exists.
- No unnecessary technology substitutions exist.

### Testing

- Required unit tests pass.
- Required integration tests pass where applicable.
- Critical end-to-end workflows pass.
- Build succeeds.
