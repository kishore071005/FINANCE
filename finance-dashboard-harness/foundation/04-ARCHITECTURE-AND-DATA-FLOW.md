# 04 — Architecture and High-Level Data Flow

## Expected Architecture

```
Frontend
    |
    | HTTP/JSON API
    v
Express API
    |
    +---- Business/Service Layer
    |
    +---- Validation
    |
    v
MongoDB

Redis 7
    |
    +---- Cache where appropriate
    |
    +---- Queues/background jobs where required
```

## Key Rules

- The frontend must **not** directly access MongoDB or Redis.
- The frontend communicates only with the backend API.
- The backend is responsible for:
  - Validation
  - Business logic
  - Database access
  - Financial calculations
  - Authorization (when authentication/roles are defined)
  - Cache access
  - Queue/background processing where required

## Module Separation

Backend code should be organized by module under `backend/src/modules/`.

Frontend code should be organized by feature under `frontend/src/features/`.
