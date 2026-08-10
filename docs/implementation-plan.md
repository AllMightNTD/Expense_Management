# Implementation Plan: Phase 0 through Phase 13

> **Project:** Personal Finance & Savings Management Platform  
> **Development Strategy:** Isolated Git Worktrees in `../Expense_Management_worktrees/`  

---

## 1. Sequential Phase Roadmap

- **Phase 0: Foundation & Tooling** (`feature/foundation`)
  - Monorepo Turborepo setup, `pnpm` workspaces, Docker PostgreSQL 16 / Redis 7, Prisma ORM 5.22, Swagger/OpenAPI setup.
- **Phase 1: Authentication & Sessions** (`feature/auth`)
  - DB session ledger (`sessions`), Passport JWT auth, HTTP-only refresh cookies, `/auth/logout-all`, user profile & timezone settings.
- **Phase 2: Accounts & Categories** (`feature/accounts`)
  - Multi-account management, category taxonomy tree (`isSystem`, `userId`), `BalanceReconciliationService`.
- **Phase 3: Transaction Ledger** (`feature/transactions`)
  - Core transaction processing (`INCOME`, `EXPENSE`, `TRANSFER`), `IdempotencyInterceptor`, atomic balance synchronization.
- **Phase 4: Financial Engine** (`feature/financial-engine`)
  - Pure financial calculators (`balance`, `income`, `expense`, `savings-rate`, `saving-capacity`, `safe-to-spend`, `daily-safe-spend`).
- **Phase 5: Budgets** (`feature/budgets`)
  - Category budget tracking, `UNDER_BUDGET`, `WARNING`, `OVER_BUDGET` thresholds.
- **Phase 6: Savings Goals & Contributions** (`feature/savings-goals`)
  - Goal target tracker (`goalType`), `savings_contributions` ledger, atomic current amount updates.
- **Phase 7: Savings Planning** (`feature/savings-planning`)
  - Strategy policies (`CONSERVATIVE`, `BALANCED`, `AGGRESSIVE`), goal feasibility projections.
- **Phase 8: Dashboard Orchestration** (`feature/dashboard`)
  - `GET /api/v1/dashboard/overview` orchestrating financial domain services.
- **Phase 9: Analytics** (`feature/analytics`)
  - Cash flow trends, category expense breakdowns, monthly summaries.
- **Phase 10: Financial Health** (`feature/financial-health`)
  - 5-component normalized health score (0–100).
- **Phase 11: Insights Engine** (`feature/insights`)
  - Actionable financial insight generator.
- **Phase 12: Recurring & Subscriptions** (`feature/recurring-subscriptions`)
  - Automated recurring transaction execution and subscription trackers.
- **Phase 13: System Hardening & Optimization** (`feature/optimization`)
  - Redis caching, E2E test verification, query indexing, production deployment scripts.
