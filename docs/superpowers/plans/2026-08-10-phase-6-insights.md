# Phase 6: Financial Insights & AI Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated Financial Insights, Expense Reduction Recommendations, Spending Anomaly Detection, and Goal Completion Date Projections based on user cash flow.

**Architecture:** `packages/shared` defines DTO contracts and calculation logic (`calculateGoalCompletionDate`). `apps/api` implements `InsightsModule` (`GET /api/v1/insights`, `GET /api/v1/insights/projections`) analyzing 3-month category spending averages and goal progress. `apps/web` provides the `/insights` view featuring Financial Health Score, Category Breakdown, Expense Reduction recommendations, and Goal Reach Timelines.

**Tech Stack:** NestJS 10, Prisma ORM, PostgreSQL 16, Next.js 14 App Router, Recharts 2.12, Tailwind CSS, Vitest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/insights` on branch `feature/insights`.
- Goal completion date calculation: `Remaining Amount / Average Monthly Savings`.
- Anomaly detection flags categories where current month spending exceeds 1.5x the 3-month historical average.
- Expense reduction advice highlights top 3 highest spending non-essential categories.
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Financial Insights DTOs & Calculation Utilities (`packages/shared`)

**Files:**
- Create: `packages/shared/src/schemas/insight.schema.ts`
- Create: `packages/shared/src/schemas/insight.schema.spec.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: Money utility
- Produces: `FinancialInsightDto`, `GoalProjectionDto`, `calculateGoalCompletionDate(remainingBigInt, monthlySavingsBigInt)`

- [ ] **Step 1: Write test for goal completion date calculation in `packages/shared/src/schemas/insight.schema.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateGoalCompletionMonths } from './insight.schema';

describe('Financial Insights Formulas', () => {
  it('calculates completion months correctly', () => {
    // 17,500,000 VND remaining with 3,500,000 VND/month savings = 5 months
    expect(calculateGoalCompletionMonths(BigInt(17500000), BigInt(3500000))).toBe(5);
  });
});
```

- [ ] **Step 2: Implement `packages/shared/src/schemas/insight.schema.ts`**

```typescript
export interface CategorySpendingBreakdown {
  categoryName: string;
  categoryColor: string;
  totalSpent: string;
  percentage: number;
}

export interface ExpenseReductionAdvice {
  categoryName: string;
  currentMonthlySpent: string;
  suggestedMonthlySpent: string;
  potentialSavings: string;
  tip: string;
}

export interface GoalProjectionDto {
  goalId: string;
  goalName: string;
  remainingAmount: string;
  monthlySavingsRate: string;
  estimatedMonthsRemaining: number;
  projectedCompletionDate: string;
}

export interface FinancialInsightDto {
  healthScore: number;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
  categoryBreakdown: CategorySpendingBreakdown[];
  reductionAdvice: ExpenseReductionAdvice[];
  goalProjections: GoalProjectionDto[];
}

export function calculateGoalCompletionMonths(remaining: bigint, monthlySavings: bigint): number {
  if (monthlySavings <= BigInt(0)) return 999;
  return Math.ceil(Number(remaining) / Number(monthlySavings));
}
```

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Financial Insights DTO contracts and goal completion calculator"
```

---

### Task 2: NestJS Insights Module (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/insights/insights.service.ts`
- Create: `apps/api/src/modules/insights/insights.controller.ts`
- Create: `apps/api/src/modules/insights/insights.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard
- Produces: `GET /api/v1/insights` returning Financial Health Score, Category Breakdown, Reduction Advice, and Goal Reach Projections

- [ ] **Step 1: Implement `insights.service.ts`**

Analyze category spending over the last 30 days, calculate Financial Health Score (based on Savings Rate % and Budget Adherence), generate top 3 expense reduction tips, and calculate goal completion projections.

- [ ] **Step 2: Implement `insights.controller.ts`**

Expose protected `@Get()` endpoint.

- [ ] **Step 3: Build NestJS API**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement InsightsModule with health score rating, expense reduction advice, and goal completion projections"
```

---

### Task 3: Next.js Insights & AI Analytics UI (`apps/web`)

**Files:**
- Create: `apps/web/app/insights/page.tsx`
- Create: `apps/web/components/insights/health-score-card.tsx`

**Interfaces:**
- Consumes: `/api/v1/insights`
- Produces: Insights Dashboard page (`/insights`) with Health Score meter, Category Breakdown pie visual, Advice Cards, and Goal Timeline

- [ ] **Step 1: Create `apps/web/components/insights/health-score-card.tsx`**

Build visual health score badge and summary meter.

- [ ] **Step 2: Create `apps/web/app/insights/page.tsx`**

Assemble `/insights` page with Category Breakdown Recharts PieChart, Expense Reduction Cards, and Goal Completion Timeline.

- [ ] **Step 3: Build Next.js Web App**

Run: `npx -y pnpm@10.5.2 --filter @expense/web build`
Expected: PASS (All static pages prerendered)

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): add Financial Insights UI with Health Score meter, Expense Reduction recommendations, and Goal Reach timelines"
```

---

### Task 4: Baseline Verification & Integration Test

**Interfaces:**
- Consumes: Monorepo workspace
- Produces: Clean builds and unit test suite execution across all modules

- [ ] **Step 1: Run turbo build & test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test && npx -y pnpm@10.5.2 build`
Expected: PASS

- [ ] **Step 2: Final Phase 6 Commit**

```bash
git add .
git commit -m "chore(insights): complete Phase 6 Financial Insights & AI Analytics"
```
