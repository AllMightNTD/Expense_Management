# Phase 4: Budget Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement category-based budget tracking with dynamic spending thresholds (Normal <70%, Warning 70-89%, Critical ≥90%, Exceeded >100%), budget creation/editing APIs, and interactive progress bars in the web app.

**Architecture:** `packages/shared` defines Zod validation schemas for Budgets and the threshold status calculator. `apps/api` implements `BudgetsModule` (`GET /api/v1/budgets`, `POST /api/v1/budgets`, `PATCH /api/v1/budgets/:id`, `DELETE /api/v1/budgets/:id`) aggregating real-time category spending. `apps/web` provides the `/budgets` view displaying category budget progress cards and warning alerts.

**Tech Stack:** NestJS 10, Prisma ORM, PostgreSQL 16, Next.js 14 App Router, Tailwind CSS, Zod, Vitest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/budgets` on branch `feature/budgets`.
- Budget period default is `MONTHLY`.
- Budget threshold calculations:
  - `< 70%`: `NORMAL`
  - `70% - 89%`: `WARNING`
  - `≥ 90%`: `CRITICAL`
  - `> 100%`: `EXCEEDED`
- Spent amount is calculated from non-deleted EXPENSE transactions in the budget date range minus REFUND transactions in the same category.
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Budget Schemas & Status Utility (`packages/shared`)

**Files:**
- Create: `packages/shared/src/schemas/budget.schema.ts`
- Create: `packages/shared/src/schemas/budget.schema.spec.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: Zod library
- Produces: `CreateBudgetSchema`, `calculateBudgetStatus(spentBigInt, totalBigInt)`

- [ ] **Step 1: Write test for budget threshold logic in `packages/shared/src/schemas/budget.schema.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateBudgetStatus } from './budget.schema';

describe('Budget Threshold Calculations', () => {
  it('returns NORMAL when spent is under 70%', () => {
    expect(calculateBudgetStatus(BigInt(1500000), BigInt(3000000))).toBe('NORMAL');
  });

  it('returns WARNING when spent is 70-89%', () => {
    expect(calculateBudgetStatus(BigInt(2400000), BigInt(3000000))).toBe('WARNING');
  });

  it('returns CRITICAL when spent is 90-100%', () => {
    expect(calculateBudgetStatus(BigInt(2850000), BigInt(3000000))).toBe('CRITICAL');
  });

  it('returns EXCEEDED when spent is over 100%', () => {
    expect(calculateBudgetStatus(BigInt(3500000), BigInt(3000000))).toBe('EXCEEDED');
  });
});
```

- [ ] **Step 2: Implement `packages/shared/src/schemas/budget.schema.ts`**

```typescript
import { z } from 'zod';

export const BudgetPeriodSchema = z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM']);

export const CreateBudgetSchema = z.object({
  categoryId: z.string().uuid('ID danh mục không hợp lệ'),
  amount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  period: BudgetPeriodSchema.default('MONTHLY'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type BudgetStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';

export function calculateBudgetStatus(spent: bigint, total: bigint): BudgetStatus {
  if (total <= BigInt(0)) return 'NORMAL';
  const percentage = (Number(spent) / Number(total)) * 100;
  if (percentage > 100) return 'EXCEEDED';
  if (percentage >= 90) return 'CRITICAL';
  if (percentage >= 70) return 'WARNING';
  return 'NORMAL';
}
```

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Budget schemas and threshold status calculator"
```

---

### Task 2: NestJS Budgets Module (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/budgets/budgets.service.ts`
- Create: `apps/api/src/modules/budgets/budgets.controller.ts`
- Create: `apps/api/src/modules/budgets/budgets.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard
- Produces: `GET /api/v1/budgets`, `POST /api/v1/budgets`, `PATCH /api/v1/budgets/:id`, `DELETE /api/v1/budgets/:id`

- [ ] **Step 1: Implement `budgets.service.ts`**

Calculate spending per category for active budget period, format response with `spent`, `remaining`, `usagePercentage`, and `status`.

- [ ] **Step 2: Implement `budgets.controller.ts`**

Expose protected REST endpoints for CRUD operations.

- [ ] **Step 3: Build NestJS API**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement BudgetsModule with live category spending calculation and threshold alerts"
```

---

### Task 3: Next.js Budget Management UI (`apps/web`)

**Files:**
- Create: `apps/web/app/budgets/page.tsx`
- Create: `apps/web/components/budgets/budget-card.tsx`

**Interfaces:**
- Consumes: `/api/v1/budgets`
- Produces: Interactive Budget Manager page (`/budgets`) with progress bars, warning banners, and create budget modal

- [ ] **Step 1: Create `apps/web/components/budgets/budget-card.tsx`**

Build reusable budget card with progress bar, status color coding (Emerald, Amber, Rose, Exceeded Red), spent vs remaining amount display.

- [ ] **Step 2: Create `apps/web/app/budgets/page.tsx`**

Assemble main `/budgets` page with list of category budget cards and `+ Tạo ngân sách` modal.

- [ ] **Step 3: Build Next.js Web App**

Run: `npx -y pnpm@10.5.2 --filter @expense/web build`
Expected: PASS (All static pages prerendered)

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): add Budget Management page UI with category progress bars and threshold alert cards"
```

---

### Task 4: Baseline Verification & Integration Test

**Interfaces:**
- Consumes: Monorepo workspace
- Produces: Clean builds and unit test suite execution across all modules

- [ ] **Step 1: Run turbo build & test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test && npx -y pnpm@10.5.2 build`
Expected: PASS

- [ ] **Step 2: Final Phase 4 Commit**

```bash
git add .
git commit -m "chore(budgets): complete Phase 4 Budget Management System"
```
