# Phase 5: Savings Goals & Contributions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement financial Savings Goals tracking, percentage progress calculation, contribution recording linked to transactions, and automatic completion status triggers.

**Architecture:** `packages/shared` defines Zod validation schemas for Savings Goals and Contributions. `apps/api` implements `SavingGoalsModule` (`GET /api/v1/saving-goals`, `POST /api/v1/saving-goals`, `POST /api/v1/saving-goals/:id/contributions`) with database transaction isolation updating goal progress. `apps/web` provides the `/savings` view displaying goal progress cards and the contribution record modal.

**Tech Stack:** NestJS 10, Prisma ORM, PostgreSQL 16 (BigInt minor units), Next.js 14 App Router, Tailwind CSS, Zod, Vitest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/savings-goals` on branch `feature/savings-goals`.
- Target amount and saved amounts must be stored as 64-bit integer minor units (`BigInt`).
- Contributions increase `currentAmount` of the goal inside an ACID database transaction.
- When `currentAmount >= targetAmount`, goal status automatically updates to `COMPLETED`.
- Contributions can optionally reference an underlying transaction (`transactionId`) for financial traceability.
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Savings Goal Schemas & Progress Utility (`packages/shared`)

**Files:**
- Create: `packages/shared/src/schemas/saving-goal.schema.ts`
- Create: `packages/shared/src/schemas/saving-goal.schema.spec.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: Zod library
- Produces: `CreateSavingGoalSchema`, `RecordContributionSchema`, `calculateGoalProgress(currentBigInt, targetBigInt)`

- [ ] **Step 1: Write test for savings goal calculations in `packages/shared/src/schemas/saving-goal.schema.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateGoalProgress } from './saving-goal.schema';

describe('Savings Goal Calculations', () => {
  it('calculates goal completion percentage correctly', () => {
    expect(calculateGoalProgress(BigInt(27500000), BigInt(45000000))).toBe(61);
    expect(calculateGoalProgress(BigInt(45000000), BigInt(45000000))).toBe(100);
    expect(calculateGoalProgress(BigInt(50000000), BigInt(45000000))).toBe(100);
  });
});
```

- [ ] **Step 2: Implement `packages/shared/src/schemas/saving-goal.schema.ts`**

```typescript
import { z } from 'zod';

export const GoalPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const GoalStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);

export const CreateSavingGoalSchema = z.object({
  name: z.string().min(2, 'Tên mục tiêu phải ít nhất 2 ký tự'),
  targetAmount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  initialAmount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)).default(0),
  targetDate: z.string().min(1, 'Ngày mục tiêu là bắt buộc'),
  priority: GoalPrioritySchema.default('MEDIUM'),
});

export const RecordContributionSchema = z.object({
  amount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  transactionId: z.string().uuid().optional(),
  note: z.string().optional(),
});

export type CreateSavingGoalInput = z.infer<typeof CreateSavingGoalSchema>;
export type RecordContributionInput = z.infer<typeof RecordContributionSchema>;

export function calculateGoalProgress(current: bigint, target: bigint): number {
  if (target <= BigInt(0)) return 0;
  const percentage = Math.round((Number(current) / Number(target)) * 100);
  return Math.min(percentage, 100);
}
```

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Savings Goal validation schemas and progress calculator"
```

---

### Task 2: NestJS Saving Goals Module (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/saving-goals/saving-goals.service.ts`
- Create: `apps/api/src/modules/saving-goals/saving-goals.controller.ts`
- Create: `apps/api/src/modules/saving-goals/saving-goals.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard
- Produces: `GET /api/v1/saving-goals`, `POST /api/v1/saving-goals`, `POST /api/v1/saving-goals/:id/contributions`

- [ ] **Step 1: Implement `saving-goals.service.ts`**

Support Goal CRUD and contribution recording with automatic `currentAmount` increment and status trigger to `COMPLETED` when target is reached.

- [ ] **Step 2: Implement `saving-goals.controller.ts`**

Expose protected REST endpoints for goals and contributions.

- [ ] **Step 3: Build NestJS API**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement SavingGoalsModule with contribution processing and automatic goal completion"
```

---

### Task 3: Next.js Savings Goals UI (`apps/web`)

**Files:**
- Create: `apps/web/app/savings/page.tsx`
- Create: `apps/web/components/savings/goal-card.tsx`

**Interfaces:**
- Consumes: `/api/v1/saving-goals`
- Produces: Savings Hub page (`/savings`) with goal progress cards and contribution recording modal

- [ ] **Step 1: Create `apps/web/components/savings/goal-card.tsx`**

Build goal card displaying target vs current saved amount, percentage progress bar, priority badge, and `+ Đóng góp` button.

- [ ] **Step 2: Create `apps/web/app/savings/page.tsx`**

Assemble main `/savings` page displaying active goals, completed goals, and `+ Tạo mục tiêu` modal.

- [ ] **Step 3: Build Next.js Web App**

Run: `npx -y pnpm@10.5.2 --filter @expense/web build`
Expected: PASS (All static pages prerendered)

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): add Savings Goals Hub UI with goal progress cards and contribution modal"
```

---

### Task 4: Baseline Verification & Integration Test

**Interfaces:**
- Consumes: Monorepo workspace
- Produces: Clean builds and unit test suite execution across all modules

- [ ] **Step 1: Run turbo build & test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test && npx -y pnpm@10.5.2 build`
Expected: PASS

- [ ] **Step 2: Final Phase 5 Commit**

```bash
git add .
git commit -m "chore(savings): complete Phase 5 Savings Goals and Contributions"
```
