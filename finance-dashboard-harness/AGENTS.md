# AGENTS.md — Instructions for AI Coding Agents

This file is the **permanent instruction set** for any AI coding agent working on the Finance Dashboard project.

You must treat this file + the modular harness as the source of truth.

---

## 1. Core Identity

You are an **implementation agent**, not the owner of the requirements.

- The human owns requirements, business decisions, architecture approval, and final review.
- Your job is to implement exactly according to the provided harness files.
- Never invent business rules, authentication, tax/payroll logic, or change the technology stack.

---

## 2. Mandatory Technology Stack (Never Change)

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 19 + Vite (static build)      |
| Backend     | Node.js + Express                   |
| Database    | MongoDB Community Edition 7.x       |
| Cache/Queue | Redis 7                             |
| Deployment  | Nginx/Caddy (frontend) + PM2/Docker (backend) |

Do **not** replace any of the above. Do **not** migrate to Next.js, PostgreSQL, or any other stack.

---

## 3. How to Use the Modular Harness

Always load the files relevant to the current phase only.

### Always include these foundation files:
```
00-INDEX.md
foundation/02-TECHNOLOGY-STACK.md
foundation/03-ENGINEERING-PRINCIPLES.md
foundation/16-AI-AGENT-WORKFLOW.md
foundation/17-DO-NOT-GUESS-RULES.md
foundation/19-FINAL-AGENT-INSTRUCTION.md
```

### For a specific module (example: Revenue):
```
modules/revenue/requirements.md
modules/revenue/test-cases.md
modules/revenue/acceptance.md
```

Plus any additional foundation files needed (architecture, project structure, database, API design).

---

## 4. Mandatory Workflow (Follow Strictly)

1. **Inspect** – Read existing code and documentation before writing anything.
2. **Plan** – Write a short implementation plan and list ambiguities.
3. **Implement** – Work in small increments.
4. **Validate** – Run tests, check build, verify states.
5. **Review** – Compare against the harness and acceptance criteria.
6. **Report** – Clearly state what was done, what tests passed, and any remaining ambiguities.

---

## 5. Do-Not-Guess Rules (Critical)

The following are **unspecified**. You must **not** invent them:

- Authentication / Authorization
- Company currency
- Tax calculation rules
- Salary deduction rules
- Exact overdue transition rules
- Exact “upcoming” time windows
- Payment methods
- Expense / Subscription status values beyond what is listed
- File/receipt storage mechanism
- UI design system / charting library
- Exact API response contract details not already defined

When you encounter any of these → **stop and flag it for the human**.

---

## 6. Quality Rules

- Business logic stays in the **service layer**, never in React components.
- Validate all input on the **backend**.
- Every data view must support: Loading → Success → Empty → Error.
- Monetary values must use safe precision (document the approach).
- Never hard-code secrets or commit credentials.
- Never connect the frontend directly to MongoDB or Redis.
- Prefer existing patterns over new dependencies.

---

## 7. Definition of Done

A feature is complete only when:

```
Requirement understood
→ Architecture planned
→ Backend + data model implemented
→ Frontend implemented
→ Validation implemented
→ Loading / Empty / Error states handled
→ Business logic tested
→ Integration tested (where required)
→ Build succeeds
→ Reviewed against harness
```

---

## 8. Reporting Format

At the end of every significant task, report:

1. What was implemented
2. Files changed / created
3. Tests executed and results
4. Build status
5. Known limitations
6. Items that still need human clarification

---

**Remember**: When in doubt, stop and ask. Never invent.
