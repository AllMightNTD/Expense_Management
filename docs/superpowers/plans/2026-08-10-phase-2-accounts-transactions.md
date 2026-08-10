# Phase 2: Accounts, Categories & Core Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full financial Account management, Category hierarchy with default seed data, and atomic Transaction processing (Expense, Income, Transfer between accounts, Refund) with ACID balance synchronization and paginated filtering.

**Architecture:** `packages/shared` defines Zod validation schemas for Accounts, Categories, and Transactions. `apps/api` implements `AccountsModule`, `CategoriesModule`, and `TransactionsModule` with Prisma database transactions (`prisma.$transaction`) ensuring atomic balance updates and transfer/refund invariants. `apps/web` provides Accounts list/creation, Category selector, and a paginated Transaction Manager data table with filter drawers.

**Tech Stack:** NestJS 10, Prisma ORM, PostgreSQL 16 (BigInt minor units), Next.js 14 App Router, React Query, Shadcn UI / Tailwind CSS, Zod, Vitest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/accounts-transactions` on branch `feature/accounts-transactions`.
- Account balances and transaction amounts must use integer minor units (`BigInt`).
- Transfers move funds between accounts (`transferFromAccountId` -> `transferToAccountId`) without altering total net worth or counting as income/expense.
- Refunds reference an `originalTransactionId` and decrease historical expense calculations.
- Deletions are soft-deleted (`deletedAt`) with automatic account balance reversal inside an ACID transaction.
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Schemas & DTO Contracts (`packages/shared`)

**Files:**
- Create: `packages/shared/src/schemas/account.schema.ts`
- Create: `packages/shared/src/schemas/category.schema.ts`
- Create: `packages/shared/src/schemas/transaction.schema.ts`
- Create: `packages/shared/src/schemas/finance.schema.spec.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: Zod library
- Produces: `AccountSchema`, `CategorySchema`, `TransactionSchema`, `TransactionFilterSchema`

- [ ] **Step 1: Write failing test in `packages/shared/src/schemas/finance.schema.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { AccountSchema, TransactionSchema } from './index';

describe('Financial Entity Schemas', () => {
  it('validates account creation input', () => {
    const res = AccountSchema.safeParse({
      name: 'Vietcombank',
      type: 'BANK',
      initialBalance: 10000000,
    });
    expect(res.success).toBe(true);
  });

  it('validates expense transaction payload', () => {
    const res = TransactionSchema.safeParse({
      accountId: 'acc-123',
      categoryId: 'cat-456',
      type: 'EXPENSE',
      amount: 150000,
      transactionDate: new Date().toISOString(),
      note: 'Cà phê sáng',
    });
    expect(res.success).toBe(true);
  });

  it('validates transfer transaction payload requiring transferToAccountId', () => {
    const res = TransactionSchema.safeParse({
      accountId: 'acc-123',
      transferToAccountId: 'acc-789',
      type: 'TRANSFER',
      amount: 3000000,
      transactionDate: new Date().toISOString(),
    });
    expect(res.success).toBe(true);
  });
});
```

- [ ] **Step 2: Implement schemas**

Write `AccountSchema`, `CategorySchema`, `TransactionSchema` using Zod.

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS (All schema tests pass)

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Zod validation schemas for Accounts, Categories and Transactions"
```

---

### Task 2: NestJS Accounts & Categories Modules (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/accounts/accounts.service.ts`
- Create: `apps/api/src/modules/accounts/accounts.controller.ts`
- Create: `apps/api/src/modules/accounts/accounts.module.ts`
- Create: `apps/api/src/modules/categories/categories.service.ts`
- Create: `apps/api/src/modules/categories/categories.controller.ts`
- Create: `apps/api/src/modules/categories/categories.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, JwtAuthGuard
- Produces: Account CRUD (`/accounts`) and Category CRUD + Seed default categories (`/categories`)

- [ ] **Step 1: Write `accounts.service.ts`**

Implement CRUD operations with user ownership scoping (`where: { userId }`).

- [ ] **Step 2: Write `categories.service.ts`**

Implement hierarchical Category CRUD + default category seed data (Food, Housing, Transportation, Shopping, Entertainment, Health, Education).

- [ ] **Step 3: Build `@expense/api`**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement AccountsModule and CategoriesModule with default seeding"
```

---

### Task 3: Atomic Transaction Processing Engine (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/transactions/transactions.service.ts`
- Create: `apps/api/src/modules/transactions/transactions.controller.ts`
- Create: `apps/api/src/modules/transactions/transactions.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService (`prisma.$transaction`), AccountsService
- Produces: Atomic transaction creation, refund processing, transfers, soft-deletions, and paginated query engine (`GET /transactions`)

- [ ] **Step 1: Implement `transactions.service.ts` with `prisma.$transaction`**

```typescript
// Enforce atomic balance updates based on transaction type
async createTransaction(userId: string, dto: CreateTransactionDto) {
  return this.prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: BigInt(dto.amount),
        transactionDate: new Date(dto.transactionDate),
        note: dto.note,
        transferFromAccountId: dto.type === 'TRANSFER' ? dto.accountId : undefined,
        transferToAccountId: dto.transferToAccountId,
        originalTransactionId: dto.originalTransactionId,
      },
    });

    if (dto.type === 'EXPENSE') {
      await tx.account.update({
        where: { id: dto.accountId },
        data: { currentBalance: { decrement: BigInt(dto.amount) } },
      });
    } else if (dto.type === 'INCOME' || dto.type === 'REFUND') {
      await tx.account.update({
        where: { id: dto.accountId },
        data: { currentBalance: { increment: BigInt(dto.amount) } },
      });
    } else if (dto.type === 'TRANSFER' && dto.transferToAccountId) {
      await tx.account.update({
        where: { id: dto.accountId },
        data: { currentBalance: { decrement: BigInt(dto.amount) } },
      });
      await tx.account.update({
        where: { id: dto.transferToAccountId },
        data: { currentBalance: { increment: BigInt(dto.amount) } },
      });
    }

    return transaction;
  });
}
```

- [ ] **Step 2: Build NestJS API**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement atomic Transaction engine with ACID balance updates and transfers"
```

---

### Task 4: Next.js Accounts & Transactions Management UI (`apps/web`)

**Files:**
- Create: `apps/web/app/accounts/page.tsx`
- Create: `apps/web/app/transactions/page.tsx`
- Create: `apps/web/components/transactions/transaction-table.tsx`
- Create: `apps/web/components/transactions/add-transaction-modal.tsx`

**Interfaces:**
- Consumes: `/api/v1/accounts`, `/api/v1/categories`, `/api/v1/transactions`
- Produces: Accounts manager grid, Paginated transaction data table with search, category filters, and quick transaction modal

- [ ] **Step 1: Write `apps/web/app/accounts/page.tsx`**

Build Accounts dashboard showing current account balances (Bank, Cash, E-Wallet) and account creation modal.

- [ ] **Step 2: Write `apps/web/app/transactions/page.tsx` & components**

Build Transaction table with server-side pagination controls, date filters, type badges (EXPENSE in red, INCOME in green, TRANSFER in blue, REFUND in purple), and quick `+ Add Transaction` modal.

- [ ] **Step 3: Build Next.js Web App**

Run: `npx -y pnpm@10.5.2 --filter @expense/web build`
Expected: PASS (All pages prerendered successfully)

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): add Accounts management and Paginated Transaction Data Table UI"
```

---

### Task 5: Baseline Verification & Integration Test

**Interfaces:**
- Consumes: Entire Phase 2 monorepo setup
- Produces: Verified unit tests and production builds across packages

- [ ] **Step 1: Run turbo build & test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test && npx -y pnpm@10.5.2 build`
Expected: PASS

- [ ] **Step 2: Final Phase 2 Commit**

```bash
git add .
git commit -m "chore(transactions): complete Phase 2 Accounts, Categories and Core Transactions"
```
