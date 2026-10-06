# 🛠️ Opencode Agent — Phase-by-Phase Prompt & File Guide

## How To Use This Guide

For each phase:
1. **Always paste the Global Files first** (listed below)
2. **Then paste the Phase-Specific Files**
3. **Then paste the Prompt** at the end as your instruction

---

## 🔒 Global Files (ALWAYS Include in Every Phase)

These **6 files** go into every single phase. Paste them first.

```
1. AGENTS.md
2. 00-INDEX.md
3. foundation/02-TECHNOLOGY-STACK.md
4. foundation/03-ENGINEERING-PRINCIPLES.md
5. foundation/16-AI-AGENT-WORKFLOW.md
6. foundation/17-DO-NOT-GUESS-RULES.md
7. foundation/19-FINAL-AGENT-INSTRUCTION.md
8. phases/PHASE-ORDER.md
```

---

---

## Phase 0 — Foundation Setup

### Files to Paste (Global + These)

```
foundation/01-PURPOSE-AND-OBJECTIVES.md
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/09-REDIS-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
```

**Total files for Phase 0: 8 global + 12 phase-specific = 20 files**

### Prompt

```
## Task: Phase 0 — Foundation Setup

You are starting a brand-new Finance Dashboard project.
Read ALL the attached harness files carefully. They are your source of truth.

Your goal: Create a clean, working foundation that follows the harness exactly.

### What you must create

1. **Project structure** exactly as defined in foundation/05-PROJECT-STRUCTURE.md
2. **Frontend** — React 19 + Vite, basic layout/navigation skeleton, reusable Loading/Empty/Error state components, static production build capability
3. **Backend** — Node.js + Express, modular folder structure under backend/src/modules/, central error-handling middleware, consistent API response helper, health-check endpoint (GET /api/health)
4. **Database** — MongoDB connection setup using environment variables, graceful failure
5. **Redis** — Redis connection setup using environment variables, graceful failure
6. **Environment** — .env.example with all required variables (no real secrets)
7. **Testing skeleton** — Basic unit + integration test setup
8. **Documentation** — README.md with how to run the project

### Constraints

- Do NOT implement any business modules (no Revenue, Expenses, etc.)
- Do NOT invent authentication
- Do NOT invent currency, tax rules, or any business logic
- Do NOT change the technology stack
- Prefer minimal dependencies
- All configuration from environment variables

### Deliverables

Report:
1. What was created
2. Exact commands to install, run frontend, run backend, and build
3. Confirmation that GET /api/health works
4. Confirmation that frontend static build succeeds
5. Any ambiguities found

Follow the AI Agent Workflow strictly: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 1 — Revenue Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/revenue/requirements.md
modules/revenue/test-cases.md
modules/revenue/acceptance.md
```

**Total files for Phase 1: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 1 — Revenue Module

The Foundation (Phase 0) is already complete.
Now implement the Revenue module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Revenue module under backend/src/modules/revenue/
- MongoDB model/collection for invoices/revenue
- Validation for all required fields and allowed statuses
- Service layer with business logic
- REST API endpoints under /api/revenue
- Proper error responses (no internal details leaked)

**Frontend:**
- Revenue feature under frontend/src/features/revenue/
- Page that lists invoices
- Ability to create / view invoices
- Visual status indicators for: Pending, Partially Paid, Paid, Overdue
- Loading, Empty, and Error states
- Client-side validation before submission

**Tests:**
- Unit tests for: status validation, amount validation, missing required fields, net calculations
- Integration tests for create / read flows

### Strict Rules

- ONLY four statuses allowed: Pending, Partially Paid, Paid, Overdue
- Amount must be non-negative and validated
- Customer is required
- Do NOT invent: currency, tax rules, exact overdue transition logic, invoice uniqueness rules, authentication
- Monetary precision must be safe and documented
- Business logic stays in service layer
- Follow existing patterns from Phase 0

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status (frontend + backend)
6. Any ambiguities needing human decision (especially overdue logic, currency, uniqueness)

All items in modules/revenue/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 2 — Expenses Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/expenses/requirements.md
modules/expenses/test-cases.md
modules/expenses/acceptance.md
```

**Total files for Phase 2: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 2 — Expenses Module

Phases 0–1 are already complete.
Now implement the Expenses module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Expenses module under backend/src/modules/expenses/
- MongoDB model/collection for expenses
- Validation for all required fields (categories from harness's strict list, departments, vendors, amounts)
- Service layer with business logic
- REST API endpoints under /api/expenses
- Proper error responses

**Frontend:**
- Expenses feature under frontend/src/features/expenses/
- Page to list expenses
- Ability to create / view / filter expenses
- Category and department filtering
- Loading, Empty, and Error states
- Client-side validation before submission

**Tests:**
- Unit tests for: category validation, amount validation, required fields
- Integration tests for create / read flows

### Strict Rules

- Use ONLY the expense categories defined in the requirements
- Amount must be non-negative and validated
- Do NOT invent: currency, tax rules, expense status values beyond what is listed, authentication
- Business logic stays in service layer
- Follow existing patterns from Phase 0 and Phase 1

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision

All items in modules/expenses/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 3 — Salaries Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/salaries/requirements.md
modules/salaries/test-cases.md
modules/salaries/acceptance.md
```

**Total files for Phase 3: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 3 — Salaries Module

Phases 0–2 are already complete.
Now implement the Salaries module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Salaries module under backend/src/modules/salaries/
- MongoDB model/collection for employees/salaries
- Validation for all required fields
- Service layer with business logic (salary/stipend calculations, department totals, employee totals)
- REST API endpoints under /api/salaries
- Proper error responses

**Frontend:**
- Salaries feature under frontend/src/features/salaries/
- Page to list employees and salary information
- Ability to create / view salary records
- Department-level salary totals
- Loading, Empty, and Error states
- Client-side validation before submission

**Tests:**
- Unit tests for: salary calculations, required field validation, department totals
- Integration tests for create / read flows

### Strict Rules

- Do NOT invent: salary deduction rules, employment type values, currency, tax/payroll rules, authentication
- Monetary precision must be safe and documented
- Business logic stays in service layer
- Follow existing patterns from previous phases

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially deduction rules, employment types)

All items in modules/salaries/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 4 — Subscriptions Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/subscriptions/requirements.md
modules/subscriptions/test-cases.md
modules/subscriptions/acceptance.md
```

**Total files for Phase 4: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 4 — Subscriptions Module

Phases 0–3 are already complete.
Now implement the Subscriptions module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Subscriptions module under backend/src/modules/subscriptions/
- MongoDB model/collection for subscriptions
- Validation for all required fields (billing cycle, costs, renewal dates)
- Service layer with business logic (monthly cost normalization, renewal tracking)
- REST API endpoints under /api/subscriptions
- Proper error responses

**Frontend:**
- Subscriptions feature under frontend/src/features/subscriptions/
- Page to list SaaS/recurring subscriptions
- Ability to create / view subscriptions
- Billing cycle display (monthly / annual)
- Normalized monthly cost view
- Renewal date indicators
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: monthly cost normalization, billing cycle validation, required fields
- Integration tests for create / read flows

### Strict Rules

- Do NOT invent: subscription status values beyond what is listed, exact upcoming-renewal time window, currency, authentication
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially renewal window, status values)

All items in modules/subscriptions/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 5 — Domains / Hosting Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/domains/requirements.md
modules/domains/test-cases.md
modules/domains/acceptance.md
```

**Total files for Phase 5: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 5 — Domains / Hosting Module

Phases 0–4 are already complete.
Now implement the Domains/Hosting module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Domains module under backend/src/modules/domains/
- MongoDB model/collection for domains and hosting
- Validation for all required fields (registrars, renewal dates, costs, hosting providers)
- Service layer with business logic
- REST API endpoints under /api/domains
- Proper error responses

**Frontend:**
- Domains feature under frontend/src/features/domains/
- Page to list domains and hosting
- Ability to create / view domain records
- Registrar and hosting provider display
- Renewal date and cost indicators
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: required field validation, cost validation
- Integration tests for create / read flows

### Strict Rules

- Do NOT invent: currency, authentication, exact renewal time windows
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision

All items in modules/domains/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 6 — Vendors Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/vendors/requirements.md
modules/vendors/test-cases.md
modules/vendors/acceptance.md
```

**Total files for Phase 6: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 6 — Vendors Module

Phases 0–5 are already complete.
Now implement the Vendors module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Vendors module under backend/src/modules/vendors/
- MongoDB model/collection for vendors
- Validation for all required fields (contact info, payment terms)
- Service layer with business logic (total paid / pending amount derived, payment history)
- REST API endpoints under /api/vendors
- Proper error responses

**Frontend:**
- Vendors feature under frontend/src/features/vendors/
- Page to list vendors
- Ability to create / view vendor records
- Contact and payment terms display
- Total paid / pending amounts
- Payment history view
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: required field validation, derived amount calculations
- Integration tests for create / read flows

### Strict Rules

- Do NOT invent: vendor contract storage mechanism, currency, payment methods, authentication
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially contract storage, payment methods)

All items in modules/vendors/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 7 — Budgets Module

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/budgets/requirements.md
modules/budgets/test-cases.md
modules/budgets/acceptance.md
```

**Total files for Phase 7: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 7 — Budgets Module

Phases 0–6 are already complete.
Now implement the Budgets module ONLY.
Read ALL attached harness files. They are your source of truth.

### What you must build

**Backend:**
- Budgets module under backend/src/modules/budgets/
- MongoDB model/collection for budgets
- Validation for all required fields
- Service layer with business logic (actual spending derived from expenses + salaries, remaining budget, overrun indication)
- REST API endpoints under /api/budgets
- Proper error responses

**Frontend:**
- Budgets feature under frontend/src/features/budgets/
- Page to list departmental budgets
- Ability to create / view budget records
- Budget vs actual spending comparison
- Remaining budget display
- Overrun visual indicators
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: budget calculations, remaining budget, overrun detection
- Integration tests for create / read flows

### Strict Rules

- Actual spending must be derived from real data (expenses + salaries modules), not invented
- Do NOT invent: department master-data source, currency, authentication
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially department source, spending derivation)

All items in modules/budgets/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 8 — Finance Overview

> ⚠️ **Do NOT start this until Phases 1–7 are ALL stable and tested.**

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/overview/requirements.md
modules/overview/test-cases.md
modules/overview/acceptance.md
```

**Total files for Phase 8: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 8 — Finance Overview

Phases 0–7 are ALL complete and stable.
Now implement the Finance Overview module.
Read ALL attached harness files. They are your source of truth.

This module AGGREGATES data from Revenue, Expenses, Salaries, Subscriptions, and Payments.
It does NOT create its own financial records.

### What you must build

**Backend:**
- Overview module under backend/src/modules/overview/
- Service layer that aggregates data from existing modules (revenue, expenses, salaries, subscriptions)
- REST API endpoints under /api/overview
- Summary calculations (total revenue, total expenses, net position, pending payments, upcoming payments)
- Proper error responses

**Frontend:**
- Overview feature under frontend/src/features/overview/
- Main dashboard page showing aggregated financial position
- Summary cards / KPIs (total revenue, total expenses, net, pending, upcoming)
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: aggregation calculations, summary logic
- Integration tests for overview endpoints

### Strict Rules

- Overview must read from existing module data — do NOT duplicate data
- Do NOT invent: currency, exact "upcoming" time window definitions, authentication
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially "upcoming" time window)

All items in modules/overview/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Phase 9 — Reports

> ⚠️ **Do NOT start this until ALL Phases 0–8 are complete.**

### Files to Paste (Global + These)

```
foundation/04-ARCHITECTURE-AND-DATA-FLOW.md
foundation/05-PROJECT-STRUCTURE.md
foundation/06-FRONTEND-RESPONSIBILITIES.md
foundation/07-BACKEND-RESPONSIBILITIES.md
foundation/08-DATABASE-GUIDELINES.md
foundation/10-API-DESIGN-GUIDELINES.md
foundation/11-ERROR-HANDLING-AND-STATES.md
foundation/12-FINANCIAL-DATA-SAFETY.md
foundation/13-TESTING-STRATEGY.md
foundation/18-DEFINITION-OF-DONE.md
modules/reports/requirements.md
modules/reports/test-cases.md
modules/reports/acceptance.md
```

**Total files for Phase 9: 8 global + 13 phase-specific = 21 files**

### Prompt

```
## Task: Phase 9 — Reports Module

ALL Phases 0–8 are complete and stable.
Now implement the Reports module — the final module.
Read ALL attached harness files. They are your source of truth.

This module generates financial reports from ALL existing module data.

### What you must build

**Backend:**
- Reports module under backend/src/modules/reports/
- Service layer that pulls and aggregates data from all financial modules
- REST API endpoints under /api/reports
- Report generation logic (revenue reports, expense reports, salary reports, budget reports, comprehensive financial reports)
- Proper error responses

**Frontend:**
- Reports feature under frontend/src/features/reports/
- Reports page with report type selection
- Date range filtering
- Report display (tables/summaries)
- Loading, Empty, and Error states

**Tests:**
- Unit tests for: report generation logic, data aggregation
- Integration tests for report endpoints

### Strict Rules

- Reports must read from existing module data — do NOT duplicate data
- Do NOT invent: reporting export formats, currency, authentication
- Business logic stays in service layer
- Follow existing patterns

### Deliverables

Report:
1. What was implemented
2. Files created / changed
3. API endpoints available
4. Test results
5. Build status
6. Any ambiguities needing human decision (especially export formats)

All items in modules/reports/acceptance.md must be checked.
Follow: Inspect → Plan → Implement → Validate → Review → Report.
```

---

---

## Quick Reference — File Count Per Phase

| Phase | Global Files | Phase Files | Total |
|-------|-------------|-------------|-------|
| 0 — Foundation    | 8 | 12 | **20** |
| 1 — Revenue       | 8 | 13 | **21** |
| 2 — Expenses      | 8 | 13 | **21** |
| 3 — Salaries      | 8 | 13 | **21** |
| 4 — Subscriptions | 8 | 13 | **21** |
| 5 — Domains       | 8 | 13 | **21** |
| 6 — Vendors       | 8 | 13 | **21** |
| 7 — Budgets       | 8 | 13 | **21** |
| 8 — Overview      | 8 | 13 | **21** |
| 9 — Reports       | 8 | 13 | **21** |

---

## Tips for Opencode

1. **Start fresh conversation** for each phase — don't carry over old context
2. **Paste files BEFORE the prompt** — let the agent read rules first, task last
3. **After each phase**: verify the build works, tests pass, then move to next
4. **Phase 8 & 9** depend on earlier phases — don't skip ahead
5. **If the agent asks questions about do-not-guess items** — that's GOOD, answer them before it continues
