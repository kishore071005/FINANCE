# 12 — Financial Data Safety

Because this is an internal finance system:

- Do not expose credentials.
- Do not hard-code secrets.
- Do not log passwords, tokens, or unnecessary sensitive financial data.
- Do not expose database connection strings to the frontend.
- Do not allow the frontend to connect directly to MongoDB.
- Validate financial input on the server.
- Use appropriate monetary precision.
- Keep authorization enforcement on the backend.

## Important Note

Authentication and role definitions have **not yet been provided**.  
Do not invent a specific authentication provider or role model.
