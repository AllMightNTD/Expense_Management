# Enterprise Architecture V2.1 Implementation Plan: Personal Finance & Savings Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete enterprise-grade Personal Finance & Savings Management platform based on the approved **Architecture V2.1 Specification** across 14 sequential phases (Phase 0 to Phase 13) using isolated Git Worktrees in `../Expense_Management_worktrees/`.

**Architecture:** Monorepo managed via Turborepo & `pnpm` workspaces (`apps/web`, `apps/api`, `packages/shared`). PostgreSQL 16 DB storing 16 normalized tables with `Decimal(18, 4)` monetary precision and ACID transaction consistency. Pure Financial Engine core in `apps/api/src/modules/financial/`.

**Tech Stack:** NestJS 10, Next.js 14 App Router, Prisma ORM 5.22, PostgreSQL 16, Redis 7, BullMQ, Vitest, TypeScript 5.4+, Tailwind CSS, Zod.

---

## Global Implementation Invariants
1. **Zero Logic Duplication**: Frontend, Analytics, and Controllers MUST NEVER calculate financial formulas; all financial metrics MUST pass through the **Financial Engine Core**.
2. **Strict Monetary Precision**: All monetary values MUST be defined as PostgreSQL `Decimal(18, 4)` / `Prisma.Decimal` and serialized as Strings in API responses.
3. **Single Source of Truth**: `transactions` is the sole source of truth for money flow; `accounts.currentBalance` and `savings_goals.currentAmount` are materialized views updated synchronously inside atomic Prisma `$transaction` blocks.
4. **Isolated Worktrees**: Every phase MUST be executed in its isolated worktree under `../Expense_Management_worktrees/<feature-name>`.

---

### Task 1: Phase 0 — Enterprise Database Schema & Idempotency Setup

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `packages/shared/src/index.ts`
- Create: `apps/api/src/common/interceptors/idempotency.interceptor.ts`

**Interfaces:**
- Consumes: Architecture V2.1 16-table database specification
- Produces: Synced Prisma database schema with PostgreSQL `Decimal(18, 4)` monetary types and API `IdempotencyInterceptor`

- [ ] **Step 1: Update `apps/api/prisma/schema.prisma` with 16 tables & Decimal precision**

Define `User`, `Session`, `Account`, `Category`, `Transaction`, `Transfer`, `Budget`, `BudgetCategory`, `SavingsGoal`, `SavingsContribution`, `FinancialPreference`, `Subscription`, `RecurringTransaction`, `Insight`, `IdempotencyKey`, and `AuditLog`. Enforce `Decimal(18, 4)` on all monetary fields.

- [ ] **Step 2: Run Prisma DB Push & Generate Client**

```bash
npx -y pnpm@10.5.2 --filter @expense/api exec prisma db push
npx -y pnpm@10.5.2 --filter @expense/api exec prisma generate
```

- [ ] **Step 3: Implement `IdempotencyInterceptor` in `apps/api/src/common/interceptors/`**

Interceptors checks `Idempotency-Key` header for financial mutation endpoints (`POST /transactions`, `POST /transfers`, `POST /savings-contributions`) against `idempotency_keys` table.

- [ ] **Step 4: Commit Phase 0**

```bash
git add .
git commit -m "feat(phase-0): update Prisma schema to V2.1 16-table spec with Decimal(18,4) and IdempotencyInterceptor"
```

---

### Task 2: Phase 1 — Auth, DB Session Ledger & Timezone Settings

**Files:**
- Create: `apps/api/src/modules/auth/sessions.service.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`

**Interfaces:**
- Consumes: Passport JWT auth, HTTP-only refresh cookies, `sessions` DB table
- Produces: Multi-device session management and `/auth/logout-all` endpoint

- [ ] **Step 1: Implement `SessionsService` to manage active sessions in `sessions` table**
- [ ] **Step 2: Add `/auth/logout-all` and `/auth/sessions` endpoints in `AuthController`**
- [ ] **Step 3: Update `AuthService` to store bcrypt hashes of refresh tokens in `sessions`**
- [ ] **Step 4: Run unit tests & commit Phase 1**

```bash
npx -y pnpm@10.5.2 --filter @expense/api test
git add .
git commit -m "feat(phase-1): implement DB-backed session ledger, refresh token hashing, and logout-all"
```

---

### Task 3: Phase 2 — Multi-Account & Taxonomy Tree with Reconciliation

**Files:**
- Create: `apps/api/src/modules/accounts/balance-reconciliation.service.ts`
- Modify: `apps/api/src/modules/accounts/accounts.service.ts`
- Modify: `apps/api/src/modules/categories/categories.service.ts`

**Interfaces:**
- Consumes: `accounts`, `categories` Prisma models
- Produces: System category seeds (`isSystem = true`), Account reconciliation API (`POST /accounts/:id/reconcile`)

- [ ] **Step 1: Seed default System Categories (`isSystem = true`, `userId = null`)**
- [ ] **Step 2: Implement `BalanceReconciliationService` computing expected vs materialized balance**
- [ ] **Step 3: Add `POST /accounts/:id/reconcile` endpoint returning discrepancy metrics**
- [ ] **Step 4: Commit Phase 2**

```bash
git add .
git commit -m "feat(phase-2): add system categories taxonomy tree and BalanceReconciliationService"
```

---

### Task 4: Phase 3 — Core Transaction Ledger & Atomic Transfers

**Files:**
- Create: `apps/api/src/modules/transfers/transfers.module.ts`
- Create: `apps/api/src/modules/transfers/transfers.service.ts`
- Modify: `apps/api/src/modules/transactions/transactions.service.ts`

**Interfaces:**
- Consumes: Transaction ledger inputs, `transfers` entity
- Produces: Atomic Prisma `$transaction` execution updating `accounts.currentBalance` and creating `audit_logs` entries

- [ ] **Step 1: Implement `POST /transactions/transfer` wrapped in Prisma `$transaction`**
- [ ] **Step 2: Update `TransactionsService` to handle net balance deltas on transaction update/deletion**
- [ ] **Step 3: Verify transfer entries are linked via `sourceTransactionId` and `destinationTransactionId`**
- [ ] **Step 4: Commit Phase 3**

```bash
git add .
git commit -m "feat(phase-3): implement atomic transaction ledger and inter-account transfers"
```

---

### Task 5: Phase 4 — Pure Financial Engine Core

**Files:**
- Create: `apps/api/src/modules/financial/calculators/balance.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/income.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/expense.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/savings-rate.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/saving-capacity.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/safe-to-spend.calculator.ts`
- Create: `apps/api/src/modules/financial/calculators/daily-safe-spend.calculator.ts`

**Interfaces:**
- Consumes: Transaction ledger entries, User timezone, Prisma `Decimal`
- Produces: Pure, deterministic financial calculator functions

- [ ] **Step 1: Implement `balance.calculator.ts` summing active `includeInTotalBalance = true` accounts**
- [ ] **Step 2: Implement `income.calculator.ts` & `expense.calculator.ts` filtering out transfers**
- [ ] **Step 3: Implement `savings-rate.calculator.ts` returning `null` when Income = 0**
- [ ] **Step 4: Implement `safe-to-spend.calculator.ts` & `daily-safe-spend.calculator.ts`**
- [ ] **Step 5: Write unit tests for all calculators & commit Phase 4**

```bash
npx -y pnpm@10.5.2 --filter @expense/shared test
git add .
git commit -m "feat(phase-4): implement deterministic Financial Engine Core calculators"
```

---

### Task 6: Phase 5 — Category Budget Management

**Files:**
- Modify: `apps/api/src/modules/budgets/budgets.service.ts`
- Modify: `packages/shared/src/schemas/budget.schema.ts`

**Interfaces:**
- Consumes: Category budgets, Period transactions
- Produces: Budget progress calculation (`UNDER_BUDGET`, `WARNING`, `OVER_BUDGET`)

- [ ] **Step 1: Implement category-level budget limit checks**
- [ ] **Step 2: Verify `GET /budgets/:id/progress` computes percentage usage using Decimal arithmetic**
- [ ] **Step 3: Commit Phase 5**

```bash
git add .
git commit -m "feat(phase-5): implement budget limits and dynamic progress status calculations"
```

---

### Task 7: Phase 6 — Savings Hub, Goals & Attribution Ledger

**Files:**
- Create: `apps/api/src/modules/saving-goals/saving-goals.service.ts`
- Modify: `apps/api/src/modules/saving-goals/saving-goals.controller.ts`

**Interfaces:**
- Consumes: `savings_goals`, `savings_contributions`
- Produces: Goal tracker (`goalType`), atomic contribution insertions incrementing `currentAmount`

- [ ] **Step 1: Add `goalType` (`EMERGENCY_FUND`, `GENERAL`, `PURCHASE`, `TRAVEL`, `INVESTMENT`)**
- [ ] **Step 2: Wrap contribution creation and `currentAmount` increment in atomic Prisma `$transaction`**
- [ ] **Step 3: Commit Phase 6**

```bash
git add .
git commit -m "feat(phase-6): implement savings goals with goalType and atomic contribution ledgers"
```

---

### Task 8: Phase 7 — Savings Planning & Strategy Policies

**Files:**
- Create: `apps/api/src/modules/savings-planning/savings-strategy.policy.ts`
- Create: `apps/api/src/modules/financial/calculators/goal-forecast.calculator.ts`
- Create: `apps/api/src/modules/savings-planning/savings-planning.service.ts`

**Interfaces:**
- Consumes: Goal progress, Historical saving capacity, Strategy selection
- Produces: Required monthly savings, goal completion forecast, and risk levels

- [ ] **Step 1: Implement `savings-strategy.policy.ts` for `CONSERVATIVE`, `BALANCED`, `AGGRESSIVE`**
- [ ] **Step 2: Implement `goal-forecast.calculator.ts` determining `FEASIBLE`, `AT_RISK`, `UNFEASIBLE`, `COMPLETED`**
- [ ] **Step 3: Add `POST /savings/goals/:id/plan/recalculate` endpoint**
- [ ] **Step 4: Commit Phase 7**

```bash
git add .
git commit -m "feat(phase-7): implement Savings Strategy Policies and Goal Feasibility Forecasts"
```

---

### Task 9: Phase 8 — Dashboard Orchestration Layer

**Files:**
- Modify: `apps/api/src/modules/dashboard/dashboard.service.ts`
- Modify: `apps/api/src/modules/dashboard/dashboard.controller.ts`

**Interfaces:**
- Consumes: All domain services (`FinancialEngine`, `SafeToSpend`, `CashFlow`, `Transactions`)
- Produces: Single aggregated payload for `GET /api/v1/dashboard/overview`

- [ ] **Step 1: Ensure `DashboardService` contains ZERO financial calculation logic (orchestration only)**
- [ ] **Step 2: Update `GET /api/v1/dashboard/overview` endpoint**
- [ ] **Step 3: Commit Phase 8**

```bash
git add .
git commit -m "feat(phase-8): orchestrate Dashboard API using pure Financial Engine services"
```

---

### Task 10: Phase 9 — Cash Flow & Category Analytics

**Files:**
- Create: `apps/api/src/modules/analytics/analytics.service.ts`
- Create: `apps/api/src/modules/analytics/analytics.controller.ts`

**Interfaces:**
- Consumes: Transaction ledger, User timezone
- Produces: Cash flow trend, Category expense breakdown, and Monthly summary endpoints

- [ ] **Step 1: Implement `GET /analytics/cash-flow` aggregated per user timezone**
- [ ] **Step 2: Implement `GET /analytics/expense-breakdown` by category**
- [ ] **Step 3: Commit Phase 9**

```bash
git add .
git commit -m "feat(phase-9): implement Cash Flow and Category Breakdown Analytics APIs"
```

---

### Task 11: Phase 10 — Normalized Financial Health Score & Actionable Insights

**Files:**
- Create: `apps/api/src/modules/financial/calculators/financial-health.calculator.ts`
- Create: `apps/api/src/modules/insights/insights.service.ts`

**Interfaces:**
- Consumes: Domain metrics, Emergency fund goal balance
- Produces: 5-component normalized Financial Health Score (0–100) and actionable insights

- [ ] **Step 1: Implement `financial-health.calculator.ts` normalizing 5 components to 0–100 scale**
- [ ] **Step 2: Implement `InsightsService` generating `HIGH_EXPENSE`, `GOAL_AT_RISK`, `BUDGET_WARNING` items**
- [ ] **Step 3: Add `GET /financial/health` and `GET /insights` APIs**
- [ ] **Step 4: Commit Phase 10**

```bash
git add .
git commit -m "feat(phase-10): implement normalized Financial Health Score (0-100) and Insights Generator"
```

---

### Task 12: Phase 11 — Recurring Transactions & Subscriptions

**Files:**
- Create: `apps/api/src/modules/subscriptions/subscriptions.service.ts`
- Create: `apps/api/src/modules/recurring/recurring.service.ts`

**Interfaces:**
- Consumes: `subscriptions`, `recurring_transactions` Prisma models
- Produces: Subscription commitments tracker and automated execution rules

- [ ] **Step 1: Implement `subscriptions` CRUD and link to `recurring_transactions`**
- [ ] **Step 2: Implement recurring execution rule processor**
- [ ] **Step 3: Commit Phase 11**

```bash
git add .
git commit -m "feat(phase-11): implement Subscriptions tracker and Recurring Transaction execution rules"
```

---

### Task 13: Phase 12 & 13 — System Hardening & Automated Verification

**Files:**
- Modify: `scripts/test-all.sh`

**Interfaces:**
- Consumes: `./scripts/test-all.sh`
- Produces: Verified end-to-end unit test suite and monorepo production builds

- [ ] **Step 1: Execute `./scripts/test-all.sh`**

```bash
./scripts/test-all.sh
```

- [ ] **Step 2: Commit final implementation completion**

```bash
git add .
git commit -m "chore: complete enterprise Architecture V2.1 platform implementation and testing"
```
