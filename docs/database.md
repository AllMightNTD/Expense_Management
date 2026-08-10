# Database Specification & Entity Relationship Diagram (ERD)

> **Project:** Personal Finance & Savings Management Platform  
> **Database:** PostgreSQL 16 + Prisma ORM 5.22  
> **Monetary Precision:** Decimal(18, 4)  

---

## 1. Schema Tables (16 Normalized Tables)

1. **`users`**: `id`, `email` [UNIQUE], `passwordHash`, `displayName`, `avatarUrl`, `defaultCurrency`, `timezone`, `locale`, `status`, `createdAt`, `updatedAt`, `deletedAt`.
2. **`sessions`**: `id`, `userId`, `refreshTokenHash`, `deviceName`, `ipAddress`, `userAgent`, `expiresAt`, `revokedAt`, `createdAt`, `lastUsedAt`.
3. **`accounts`**: `id`, `userId`, `name`, `type`, `currency`, `initialBalance` [Decimal(18,4)], `currentBalance` [Decimal(18,4)], `status`, `includeInTotalBalance`, `createdAt`, `updatedAt`, `deletedAt`.
4. **`categories`**: `id`, `userId` [nullable], `name`, `type`, `icon`, `color`, `parentId` [nullable], `isSystem` [boolean], `isDefault` [boolean], `createdAt`, `updatedAt`, `deletedAt`.
5. **`transactions`**: `id`, `userId`, `accountId`, `categoryId` [nullable], `transferId` [nullable], `type`, `amount` [Decimal(18,4)], `currency`, `description`, `occurredAt`, `note`, `metadata` [JSONB], `createdAt`, `updatedAt`, `deletedAt`.
6. **`transfers`**: `id`, `userId`, `sourceAccountId`, `destinationAccountId`, `amount` [Decimal(18,4)], `currency`, `description`, `occurredAt`, `sourceTransactionId`, `destinationTransactionId`, `createdAt`.
7. **`budgets`**: `id`, `userId`, `name`, `amount` [Decimal(18,4)], `currency`, `periodType`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`.
8. **`budget_categories`**: `id`, `budgetId`, `categoryId`, `limitAmount` [Decimal(18,4)], `createdAt`, `updatedAt`.
9. **`savings_goals`**: `id`, `userId`, `name`, `description`, `goalType`, `targetAmount` [Decimal(18,4)], `currentAmount` [Decimal(18,4)], `currency`, `targetDate`, `priority`, `lifecycleStatus`, `progressStatus`, `createdAt`, `updatedAt`, `completedAt`, `deletedAt`.
10. **`savings_contributions`**: `id`, `goalId`, `userId`, `amount` [Decimal(18,4)], `currency`, `sourceAccountId`, `transactionId` [nullable], `contributedAt`, `note`, `createdAt`.
11. **`financial_preferences`**: `id`, `userId` [UNIQUE], `defaultSavingsStrategy`, `defaultSavingsRate`, `safetyBufferAmount` [Decimal(18,4)], `safetyBufferPercentage`, `safeToSpendEnabled`, `createdAt`, `updatedAt`.
12. **`subscriptions`**: `id`, `userId`, `name`, `amount` [Decimal(18,4)], `currency`, `billingCycle`, `nextBillingDate`, `categoryId`, `status`, `createdAt`, `updatedAt`.
13. **`recurring_transactions`**: `id`, `userId`, `accountId`, `categoryId`, `subscriptionId` [nullable], `type`, `amount` [Decimal(18,4)], `description`, `frequency`, `nextOccurrence`, `endDate`, `status`, `createdAt`, `updatedAt`.
14. **`insights`**: `id`, `userId`, `type`, `severity`, `title`, `description`, `metadata` [JSONB], `generatedAt`, `expiresAt`, `isRead`.
15. **`idempotency_keys`**: `id`, `userId`, `key`, `requestPath`, `responseStatus`, `responseBody` [JSONB], `createdAt`, `expiresAt`.
16. **`audit_logs`**: `id`, `userId`, `entityType`, `entityId`, `action`, `oldValue` [JSONB], `newValue` [JSONB], `createdAt`.

---

## 2. Database Constraints
- **Amount Positivity**: `amount > 0` on `transactions`, `transfers`, `savings_contributions`, `budget_categories`, `subscriptions`, `budgets`, `savings_goals.targetAmount`.
- **Non-negative Current Amount**: `savings_goals.currentAmount >= 0`.
- **Distinct Transfer Accounts**: `sourceAccountId <> destinationAccountId`.
- **Percentage Bounds**: `0 <= safetyBufferPercentage <= 100`.

---

## 3. Database Indexing Strategy
- `transactions`: `(userId, occurredAt)`, `(userId, type, occurredAt)`, `(userId, accountId, occurredAt)`, `(userId, categoryId, occurredAt)`.
- `accounts`: `(userId, status)`.
- `savings_contributions`: `(goalId, contributedAt)`.
- `budgets`: `(userId, startDate, endDate)`.
- `insights`: `(userId, generatedAt)`, `(userId, isRead)`.
- `sessions`: `(userId, expiresAt)`.
- `idempotency_keys`: `(userId, key)` [UNIQUE].
