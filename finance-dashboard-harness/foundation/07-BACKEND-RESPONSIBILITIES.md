# 07 — Backend Responsibilities

Express backend responsibilities:

- Expose REST-style APIs (unless the existing project specifies another approved API convention).
- Validate request data.
- Apply business rules.
- Perform financial calculations.
- Read/write MongoDB.
- Use Redis for appropriate caching or queue use cases.
- Return consistent responses.
- Handle errors centrally.
- Log useful operational information without exposing sensitive financial information unnecessarily.

## Key Rules

- Keep business logic in the service layer.
- Keep database access isolated from controllers where practical.
- Validate all financial input on the server.
- Never expose stack traces, database errors, secrets, or internal implementation details to normal users.
