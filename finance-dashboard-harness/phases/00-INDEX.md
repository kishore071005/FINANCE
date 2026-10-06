# Finance Dashboard — Modular AI Agent Harness Index

This is the **master index** of the modular harness derived from the original Finance Dashboard AI Coding Agent Harness.

## Purpose of This Structure

The original harness is very large. Loading the entire document every time causes context loss and reduced reliability.

This modular structure allows you to give an AI coding agent **only the files required for the current phase or module**.

## Recommended Loading Strategy

### Always include (Foundation)
```
00-INDEX.md
foundation/02-TECHNOLOGY-STACK.md
foundation/03-ENGINEERING-PRINCIPLES.md
foundation/16-AI-AGENT-WORKFLOW.md
foundation/17-DO-NOT-GUESS-RULES.md
foundation/19-FINAL-AGENT-INSTRUCTION.md
```

### For a specific module (example: Revenue)
```
AGENTS.md (if present in project)
foundation files listed above
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
modules/revenue/requirements.md
modules/revenue/test-cases.md
modules/revenue/acceptance.md
```

### For Overview or Reports (later phases)
Load the foundation + the relevant module files + `modules/overview/` or `modules/reports/`.

## Directory Layout

```text
finance-dashboard-harness/
├── 00-INDEX.md
├── foundation/          ← Core rules that never change
├── modules/             ← One folder per functional module
│   ├── revenue/
│   ├── expenses/
│   ├── salaries/
│   ├── subscriptions/
│   ├── domains/
│   ├── vendors/
│   ├── budgets/
│   ├── overview/
│   └── reports/
└── phases/
    └── PHASE-ORDER.md   ← Recommended build order
```

## Build Phases (Summary)

See `phases/PHASE-ORDER.md` for the full recommended sequence.

1. **Phase 0** — Foundation (project setup, stack, error handling, testing skeleton)
2. **Phase 1** — Revenue
3. **Phase 2** — Expenses
4. **Phase 3** — Salaries
5. **Phase 4** — Subscriptions
6. **Phase 5** — Domains / Hosting
7. **Phase 6** — Vendors
8. **Phase 7** — Budgets
9. **Phase 8** — Finance Overview (depends on previous modules)
10. **Phase 9** — Reports (depends on all previous modules)

## Critical Rules (Always Enforce)

- Never change the technology stack defined in `foundation/02-TECHNOLOGY-STACK.md`.
- Never invent business rules listed in `foundation/17-DO-NOT-GUESS-RULES.md`.
- Follow the AI Agent Workflow in `foundation/16-AI-AGENT-WORKFLOW.md`.
- Every module must satisfy its own acceptance criteria and the global Definition of Done.

---

**Source of Truth**: All content in these files is extracted and reorganized from the original Finance Dashboard AI Coding Agent Harness. No new requirements have been invented.
