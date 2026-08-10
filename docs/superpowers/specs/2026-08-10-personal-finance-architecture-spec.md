# Architecture V2.1 Formal Specification: Personal Finance & Savings Management

> **Date:** 2026-08-10  
> **Version:** 2.1  
> **Role:** Senior Software Architect, Senior Backend Engineer, Financial Domain Engineer  
> **Status:** APPROVED & LOCK  

---

## 1. System Overview & Core Objectives

The **Personal Finance & Savings Management Platform** is an enterprise-grade financial management web application built to enable users to:
1. Track active balances across multiple monetary accounts.
2. Track monthly income and expenses accurately.
3. Classify transactions across hierarchical income/expense categories.
4. Execute atomic inter-account transfers without distorting cash flow metrics.
5. Manage category-level budgets with dynamic usage thresholds.
6. Calculate Historical Savings Capacity and Required Goal Savings.
7. Track Savings Goals and record attribution-linked contributions.
8. Provide actionable Savings Planning strategies (Conservative, Balanced, Aggressive).
9. Calculate deterministic **Safe To Spend** and **Daily Safe Spend**.
10. Measure normalized **Financial Health Scores (0–100)**.
11. Deliver actionable financial insights.
12. Track recurring transactions and subscriptions.

---

## 2. Fundamental Architectural Principles

### 2.1 Single Source of Truth
- **Money Movement**: The `transactions` ledger is the sole canonical source of truth for all monetary flow.
- **Account Balance**: `accounts.currentBalance` is a materialized/cached view. It is updated synchronously within an atomic database transaction on transaction creation/update/deletion and audited asynchronously by `BalanceReconciliationService`.
- **Savings Progress**: `savings_contributions` is the sole source of truth for goal accumulation. `savings_goals.currentAmount` is a materialized value updated synchronously in the same DB transaction as contribution creation.

### 2.2 Financial Calculation Engine Isolation
- All monetary formulas (Income, Expense, Savings Rate, Safe To Spend, Financial Health, Goal Forecast) are exclusively calculated within the **Financial Engine Core** (`apps/api/src/modules/financial/`).
- Frontend applications, API Controllers, Analytics Services, and Dashboard Orchestrators **MUST NEVER** re-implement or duplicate financial formulas.

### 2.3 Strict Decimal Precision
- All monetary fields in the database are defined as PostgreSQL `Decimal(18, 4)` and handled via `Prisma.Decimal`.
- Floating-point numbers (`number`, `float`, `double`) are strictly prohibited in financial calculations.
- REST API serializes monetary values as formatted strings (e.g. `"25000000.0000"`).

### 2.4 Controlled Mutable Financial Transactions (MVP Decision)
- Users are allowed to edit transaction metadata, categories, dates, and amounts.
- Every transaction mutation calculates net deltas, updates `accounts.currentBalance`, and logs immutable snapshots to `audit_logs` within an atomic Prisma `$transaction`.

---

## 3. Technology Stack & Monorepo Topology

```
apps/
├── web/                   # Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, Zod
└── api/                   # NestJS 10, Passport JWT, Prisma ORM 5.22, Redis 7, BullMQ, Swagger/OpenAPI

packages/
├── shared/                # DTO contracts, Zod schemas, Shared Enums, API Contracts (Zero business logic)
├── eslint-config/         # Shared ESLint configuration
└── typescript-config/     # Shared tsconfig base files
```

---

## 4. Complete Database Schema & Relations (16 Tables)

1. **`users`**: Core user accounts (`id`, `email`, `passwordHash`, `displayName`, `avatarUrl`, `defaultCurrency`, `timezone`, `locale`, `status`, `createdAt`, `updatedAt`, `deletedAt`).
2. **`sessions`**: User sessions (`id`, `userId`, `refreshTokenHash`, `deviceName`, `ipAddress`, `userAgent`, `expiresAt`, `revokedAt`, `createdAt`, `lastUsedAt`).
3. **`accounts`**: Monetary source accounts (`id`, `userId`, `name`, `type`, `currency`, `initialBalance`, `currentBalance`, `status`, `includeInTotalBalance`, `createdAt`, `updatedAt`, `deletedAt`).
4. **`categories`**: Taxonomy tree (`id`, `userId`, `name`, `type`, `icon`, `color`, `parentId`, `isSystem`, `isDefault`, `createdAt`, `updatedAt`, `deletedAt`).
5. **`transactions`**: Primary money ledger (`id`, `userId`, `accountId`, `categoryId`, `transferId`, `type`, `amount`, `currency`, `description`, `occurredAt`, `note`, `metadata`, `createdAt`, `updatedAt`, `deletedAt`).
6. **`transfers`**: Inter-account transfer relationship (`id`, `userId`, `sourceAccountId`, `destinationAccountId`, `amount`, `currency`, `description`, `occurredAt`, `sourceTransactionId`, `destinationTransactionId`, `createdAt`).
7. **`budgets`**: Category budget periods (`id`, `userId`, `name`, `amount`, `currency`, `periodType`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`).
8. **`budget_categories`**: Category limit breakdown (`id`, `budgetId`, `categoryId`, `limitAmount`, `createdAt`, `updatedAt`).
9. **`savings_goals`**: Target tracker (`id`, `userId`, `name`, `description`, `goalType`, `targetAmount`, `currentAmount`, `currency`, `targetDate`, `priority`, `lifecycleStatus`, `progressStatus`, `createdAt`, `updatedAt`, `completedAt`, `deletedAt`).
10. **`savings_contributions`**: Attribution ledger (`id`, `goalId`, `userId`, `amount`, `currency`, `sourceAccountId`, `transactionId`, `contributedAt`, `note`, `createdAt`).
11. **`financial_preferences`**: User financial behavior (`id`, `userId`, `defaultSavingsStrategy`, `defaultSavingsRate`, `safetyBufferAmount`, `safetyBufferPercentage`, `safeToSpendEnabled`, `createdAt`, `updatedAt`).
12. **`subscriptions`**: Recurring financial commitments (`id`, `userId`, `name`, `amount`, `currency`, `billingCycle`, `nextBillingDate`, `categoryId`, `status`, `createdAt`, `updatedAt`).
13. **`recurring_transactions`**: Automated execution rules (`id`, `userId`, `accountId`, `categoryId`, `subscriptionId`, `type`, `amount`, `description`, `frequency`, `nextOccurrence`, `endDate`, `status`, `createdAt`, `updatedAt`).
14. **`insights`**: Financial insight items (`id`, `userId`, `type`, `severity`, `title`, `description`, `metadata`, `generatedAt`, `expiresAt`, `isRead`).
15. **`idempotency_keys`**: Request idempotency ledger (`id`, `userId`, `key`, `requestPath`, `responseStatus`, `responseBody`, `createdAt`, `expiresAt`).
16. **`audit_logs`**: Mutation log (`id`, `userId`, `entityType`, `entityId`, `action`, `oldValue`, `newValue`, `createdAt`).

---

## 5. Financial Engine Formulas

1. **Total Balance**:
   $$\text{TotalBalance} = \sum \text{currentBalance for accounts where status = ACTIVE and includeInTotalBalance = true}$$
2. **Monthly Savings & Rate**:
   $$\text{MonthlySavings} = \text{Income} - \text{Expense}$$
   $$\text{SavingRate} = \frac{\text{Income} - \text{Expense}}{\text{Income}} \quad (\text{null if Income} = 0)$$
3. **Safe To Spend**:
   $$\text{SafeToSpend} = (\text{OpeningBalance} + \text{IncomeReceived} - \text{ActualExpense}) - \text{RemainingFixedCommitments} - \text{RemainingPlannedSavings} - \text{SafetyBuffer}$$
4. **Daily Safe Spend**:
   $$\text{DailySafeSpend} = \frac{\text{SafeToSpend}}{\text{RemainingDays}}$$
5. **Required Monthly Savings**:
   $$\text{RequiredMonthlySaving} = \frac{\text{TargetAmount} - \text{CurrentAmount}}{\text{MonthsRemaining}}$$
6. **Financial Health Score (0–100)**:
   $$\text{Score} = (\text{SavingsRateScore} \times 0.30) + (\text{BudgetAdherenceScore} \times 0.25) + (\text{EmergencyFundScore} \times 0.20) + (\text{ExpenseStabilityScore} \times 0.15) + (\text{SafeSpendScore} \times 0.10)$$

---

## 6. API Security, Idempotency & Concurrency

- **User Ownership Guard**: All queries enforce `resource.userId === authenticatedUser.id` to prevent IDOR attacks.
- **API Idempotency**: `POST /transactions`, `POST /transfers`, and `POST /savings-contributions` require `Idempotency-Key` headers saved to `idempotency_keys` for 24h.
- **Atomic Operations**: Account balances and savings goal progress updates are executed in a single Prisma `$transaction`.

---

## 7. Isolated Git Worktree Strategy

Feature development is strictly partitioned into dedicated worktrees under `../Expense_Management_worktrees/`:
1. `feature/foundation`
2. `feature/auth`
3. `feature/accounts`
4. `feature/transactions`
5. `feature/financial-engine`
6. `feature/budgets`
7. `feature/savings-goals`
8. `feature/savings-planning`
9. `feature/dashboard`
10. `feature/analytics`
11. `feature/financial-health`
12. `feature/insights`
13. `feature/recurring-subscriptions`
