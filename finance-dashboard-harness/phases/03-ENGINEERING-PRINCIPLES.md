# 03 — Engineering Principles

The AI agent must:

- Understand existing code before modifying it.
- Follow the existing project structure when one already exists.
- Avoid unnecessary rewrites.
- Keep modules separated by responsibility.
- Keep business logic out of UI components where practical.
- Validate input at API boundaries.
- Handle loading, empty, error, and success states.
- Write testable business logic.
- Avoid hard-coded financial calculations in presentation components.
- Never expose secrets in source code.
- Never commit credentials or environment-specific secrets.
- Use environment variables for configuration.
- Keep database access isolated from controllers where practical.
- Return consistent API responses.
- Use meaningful names.
- Avoid duplicated business logic.
- Do not remove existing functionality or tests without approval.
