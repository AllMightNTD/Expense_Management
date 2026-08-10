# Phase 3: Dashboard & Financial Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the central Financial Dashboard providing high-impact financial KPIs (Net Balance, Monthly Income/Expense/Savings, Safe-To-Spend, Daily Allowance), Cash Flow charts via Recharts, and recent activity feeds.

**Architecture:** `packages/shared` defines Dashboard DTO interfaces. `apps/api` implements `DashboardModule` (`GET /api/v1/dashboard`) aggregating live financial metrics from database transactions and account balances. `apps/web` implements the main `/dashboard` page featuring interactive KPI Cards, Recharts Cash Flow Bar Chart, and Recent Transactions widget.

**Tech Stack:** NestJS 10, Prisma ORM, PostgreSQL 16, Next.js 14 App Router, Recharts 2.12, Tailwind CSS, Vitest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/dashboard` on branch `feature/dashboard`.
- Financial aggregation must calculate metrics from canonical transaction and account data.
- Transfers between accounts do NOT increase Monthly Income or Expenses.
- Refunds decrease Monthly Expense total.
- Daily Safe Spend is dynamically calculated: `(Monthly Income - Fixed Costs - Savings) / Days Remaining`.
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Dashboard DTO Contracts (`packages/shared`)

**Files:**
- Modify: `packages/shared/src/types.ts`
- Create: `packages/shared/src/dashboard.spec.ts`

**Interfaces:**
- Consumes: Money calculation utilities
- Produces: `DashboardOverviewDto`, `CashFlowSummary`

- [ ] **Step 1: Write test for dashboard metrics in `packages/shared/src/dashboard.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateDailySafeSpend } from './index';

describe('Dashboard Metric Calculations', () => {
  it('calculates daily safe spend correctly for mid-month date', () => {
    // 6,000,000 VND remaining over 20 remaining days = 300,000 VND/day
    const daily = calculateDailySafeSpend(BigInt(6000000), 20);
    expect(daily).toBe(BigInt(300000));
  });
});
```

- [ ] **Step 2: Update `packages/shared/src/types.ts` with `DashboardOverviewDto`**

```typescript
export interface CashFlowChartItem {
  month: string;
  income: number;
  expense: number;
  netSavings: number;
}

export interface DashboardOverviewDto {
  netBalance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySavings: string;
  safeToSpend: string;
  dailySafeSpend: string;
  recentTransactions: Array<{
    id: string;
    accountName: string;
    categoryName: string;
    type: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'REFUND';
    amount: string;
    transactionDate: string;
    note?: string;
  }>;
  cashFlowTrend: CashFlowChartItem[];
}
```

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Dashboard Overview DTO contracts"
```

---

### Task 2: NestJS Dashboard Module (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/dashboard/dashboard.service.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.controller.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard
- Produces: `GET /api/v1/dashboard` endpoint returning aggregated KPIs and cashflow charts

- [ ] **Step 1: Implement `dashboard.service.ts`**

Calculate Net Balance, current month start/end date range in `Asia/Ho_Chi_Minh`, compute monthly Income, Expense (minus refunds), Savings, Safe-To-Spend, and fetch recent 5 transactions.

- [ ] **Step 2: Implement `dashboard.controller.ts`**

Expose `@Get()` endpoint protected by `JwtAuthGuard`.

- [ ] **Step 3: Build NestJS API**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement DashboardModule aggregating KPIs, Safe-To-Spend, and Cash Flow trends"
```

---

### Task 3: Next.js Interactive Dashboard View (`apps/web`)

**Files:**
- Create: `apps/web/app/dashboard/page.tsx`
- Create: `apps/web/components/dashboard/kpi-card.tsx`
- Create: `apps/web/components/dashboard/cashflow-chart.tsx`

**Interfaces:**
- Consumes: `/api/v1/dashboard`
- Produces: Visual Dashboard (`/dashboard`) with 6 KPI Cards, Recharts Cashflow Chart, and Recent Activity Table

- [ ] **Step 1: Create `apps/web/components/dashboard/kpi-card.tsx`**

Build responsive KPI card component supporting icon, title, value, subtitle badge, and trend indicator.

- [ ] **Step 2: Create `apps/web/components/dashboard/cashflow-chart.tsx`**

Build Recharts Bar/Area chart visualizing Income vs Expense cashflow trends.

- [ ] **Step 3: Create `apps/web/app/dashboard/page.tsx`**

Assemble main `/dashboard` page integrating KPI cards, Cashflow Chart, and Recent Activity Table.

- [ ] **Step 4: Build Next.js Web App**

Run: `npx -y pnpm@10.5.2 --filter @expense/web build`
Expected: PASS (All pages prerendered)

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat(web): implement Dashboard UI with KPI cards, Recharts cashflow charts, and recent activity"
```

---

### Task 4: Baseline Verification & Integration Test

**Interfaces:**
- Consumes: Monorepo workspace
- Produces: Clean builds and unit test suite execution across all modules

- [ ] **Step 1: Run turbo build & test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test && npx -y pnpm@10.5.2 build`
Expected: PASS

- [ ] **Step 2: Final Phase 3 Commit**

```bash
git add .
git commit -m "chore(dashboard): complete Phase 3 Dashboard and Financial Overview"
```
