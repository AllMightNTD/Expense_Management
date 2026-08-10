# Technical Design Specification: Personal Finance & Savings Management Web Application

**Date**: 2026-08-10  
**Repository Architecture**: Monorepo with Turborepo (`apps/web`, `apps/api`, `packages/shared`)  
**Core Philosophy**: *Track money → Understand money → Plan money → Save money → Reach financial goals*

---

## 1. Product Specification

### 1.1 Overview
A modern, production-ready Personal Finance & Savings Management Web Application. The application moves beyond basic expense tracking to provide financial awareness, budget discipline, savings capacity planning, dynamic safe-to-spend tracking, and goal forecasts.

### 1.2 Target Audience & Localization
- **Primary Users**: Individuals, freelancers, employees, students in Vietnam.
- **Default Currency & Timezone**: VND (`₫`), Timezone `Asia/Ho_Chi_Minh`.
- **Multi-currency Readiness**: Architecture supports foreign currencies (USD, JPY, EUR) with exchange rate lookup capabilities in future releases.

### 1.3 MVP Scope
- **Auth**: JWT Register/Login/Logout, HTTP-only Refresh Token rotation, Protected Routes.
- **Onboarding**: 5-step quick setup (Display Name, Currency, Initial Account, Monthly Income, Optional Goal).
- **Accounts**: Bank, Cash, E-Wallet, Credit Card, Savings accounts with synchronized balances.
- **Categories**: Hierarchical Income/Expense categories with default presets + custom user categories.
- **Transactions**: Expense, Income, Account-to-Account Transfer, and Refund transactions with pagination, filters, and soft deletes.
- **Dashboard**: High-level financial KPIs (Current Balance, Monthly Income/Expense/Savings, Safe-To-Spend, Daily Safe Spending, Budget Usage, Cash Flow Chart, Recent Activity).
- **Budgets**: Monthly/Weekly category budgets with dynamic warning/exceeded threshold states (<70% Normal, 70-89% Warning, ≥90% Critical, >100% Exceeded).
- **Savings Goals**: Goal creation, target dates, progress tracking, and linked contributions.
- **Savings Planning & Capacity Engine**: Historical 3-6 month income/expense analysis, saving capacity evaluation, strategy selection (Conservative, Balanced, Aggressive).
- **Safe To Spend Engine**: Monthly & dynamic daily safe spending calculations based on income, fixed costs, and savings commitments.
- **Analytics & Health Score**: Cash flow trends, category breakdown, percentage changes, and 0-100 Financial Health Score.
- **Deterministic Insights**: Rule-based spending alerts, goal delay warnings, and savings optimization suggestions.

---

## 2. Technical Architecture

### 2.1 Monorepo Layout (Turborepo)
```text
Expense_Management/
├── apps/
│   ├── web/                     # Next.js 14+ (App Router, Client & Server Components)
│   └── api/                     # NestJS 10+ (REST API, Prisma ORM, JWT Auth)
├── packages/
│   ├── shared/                  # Shared TypeScript interfaces, Zod schemas, Money utilities
│   ├── tsconfig/                # Shared TypeScript configurations
│   └── eslint-config/           # Shared ESLint rules
├── docker/
│   ├── docker-compose.yml       # Local dev setup (PostgreSQL, Redis, NestJS, Next.js)
│   └── Dockerfile.api
├── docs/
│   └── superpowers/specs/       # Technical specifications & design docs
├── turbo.json
└── package.json
```

### 2.2 Tech Stack
- **Frontend (`apps/web`)**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Shadcn UI / Radix UI, Recharts, React Query (TanStack Query v5), React Hook Form, Zod, Lucide React icons.
- **Backend (`apps/api`)**: NestJS, TypeScript, REST API, Prisma ORM, Passport JWT, bcrypt, Class Validator / Zod, BullMQ (Redis job queue).
- **Database**: PostgreSQL 16+ (Relational DB with foreign keys, index optimization, BigInt minor unit amounts).
- **Caching & Queues**: Redis 7+ (Rate limiting, session caching, recurring job queue).

---

## 3. Database Schema (Prisma / PostgreSQL)

```prisma
// Data Model Overview

enum AccountType {
  BANK
  CASH
  EWALLET
  CREDIT_CARD
  SAVINGS
  OTHER
}

enum TransactionType {
  EXPENSE
  INCOME
  TRANSFER
  REFUND
}

enum BudgetPeriod {
  WEEKLY
  MONTHLY
  CUSTOM
}

enum GoalPriority {
  LOW
  MEDIUM
  HIGH
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  PAUSED
  CANCELLED
}

enum SavingStrategy {
  CONSERVATIVE
  BALANCED
  AGGRESSIVE
}

enum RecurrenceFrequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  passwordHash     String   @map("password_hash")
  displayName      String   @map("display_name")
  avatar           String?
  defaultCurrency  String   @default("VND") @map("default_currency")
  timezone         String   @default("Asia/Ho_Chi_Minh")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  accounts         Account[]
  categories       Category[]
  transactions     Transaction[]
  budgets          Budget[]
  savingGoals      SavingGoal[]
  recurringTx      RecurringTransaction[]
  subscriptions    Subscription[]

  @@map("users")
}

model Account {
  id             String      @id @default(uuid())
  userId         String      @map("user_id")
  name           String
  type           AccountType
  currency       String      @default("VND")
  initialBalance BigInt      @default(0) @map("initial_balance")
  currentBalance BigInt      @default(0) @map("current_balance")
  isActive       Boolean     @default(true) @map("is_active")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions   Transaction[] @relation("AccountTransactions")
  transfersFrom  Transaction[] @relation("TransferFromAccount")
  transfersTo    Transaction[] @relation("TransferToAccount")
  recurringTx    RecurringTransaction[]

  @@index([userId])
  @@map("accounts")
}

model Category {
  id         String          @id @default(uuid())
  userId     String?         @map("user_id") // Nullable for global default categories
  name       String
  icon       String
  color      String
  type       TransactionType
  parentId   String?         @map("parent_id")
  isDefault  Boolean         @default(false) @map("is_default")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")

  user         User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent       Category?     @relation("CategoryHierarchy", fields: [parentId], references: [id])
  subcategories Category[]   @relation("CategoryHierarchy")
  transactions Transaction[]
  budgets      Budget[]
  recurringTx  RecurringTransaction[]

  @@index([userId])
  @@map("categories")
}

model Transaction {
  id                    String          @id @default(uuid())
  userId                String          @map("user_id")
  accountId             String          @map("account_id")
  categoryId            String?         @map("category_id")
  type                  TransactionType
  amount                BigInt          // Integer minor units (e.g. 150000 VND)
  currency              String          @default("VND")
  transactionDate       DateTime        @map("transaction_date")
  note                  String?
  transferFromAccountId String?         @map("transfer_from_account_id")
  transferToAccountId   String?         @map("transfer_to_account_id")
  originalTransactionId String?         @map("original_transaction_id") // For REFUND
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")
  deletedAt             DateTime?       @map("deleted_at")

  user                 User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  account              Account          @relation("AccountTransactions", fields: [accountId], references: [id])
  category             Category?        @relation(fields: [categoryId], references: [id])
  transferFromAccount  Account?         @relation("TransferFromAccount", fields: [transferFromAccountId], references: [id])
  transferToAccount    Account?         @relation("TransferToAccount", fields: [transferToAccountId], references: [id])
  originalTransaction  Transaction?     @relation("RefundOriginal", fields: [originalTransactionId], references: [id])
  refunds              Transaction[]    @relation("RefundOriginal")
  contributions        SavingContribution[]

  @@index([userId, transactionDate])
  @@index([accountId])
  @@index([categoryId])
  @@map("transactions")
}

model Budget {
  id         String       @id @default(uuid())
  userId     String       @map("user_id")
  categoryId String       @map("category_id")
  amount     BigInt
  period     BudgetPeriod @default(MONTHLY)
  startDate  DateTime     @map("start_date")
  endDate    DateTime     @map("end_date")
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category     @relation(fields: [categoryId], references: [id])

  @@index([userId, startDate, endDate])
  @@map("budgets")
}

model SavingGoal {
  id            String             @id @default(uuid())
  userId        String             @map("user_id")
  name          String
  targetAmount  BigInt             @map("target_amount")
  currentAmount BigInt             @default(0) @map("current_amount")
  targetDate    DateTime           @map("target_date")
  priority      GoalPriority       @default(MEDIUM)
  status        GoalStatus         @default(ACTIVE)
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")

  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  savingPlan    SavingPlan?
  contributions SavingContribution[]

  @@index([userId])
  @@map("saving_goals")
}

model SavingPlan {
  id            String         @id @default(uuid())
  savingGoalId  String         @unique @map("saving_goal_id")
  monthlyTarget BigInt         @map("monthly_target")
  weeklyTarget  BigInt         @map("weekly_target")
  dailyTarget   BigInt         @map("daily_target")
  strategy      SavingStrategy @default(BALANCED)
  startDate     DateTime       @map("start_date")
  endDate       DateTime       @map("end_date")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  savingGoal    SavingGoal     @relation(fields: [savingGoalId], references: [id], onDelete: Cascade)

  @@map("saving_plans")
}

model SavingContribution {
  id            String       @id @default(uuid())
  savingGoalId  String       @map("saving_goal_id")
  transactionId String?      @map("transaction_id")
  amount        BigInt
  contributedAt DateTime     @default(now()) @map("contributed_at")
  note          String?

  savingGoal    SavingGoal   @relation(fields: [savingGoalId], references: [id], onDelete: Cascade)
  transaction   Transaction? @relation(fields: [transactionId], references: [id], onDelete: SetNull)

  @@index([savingGoalId])
  @@map("saving_contributions")
}

model RecurringTransaction {
  id                String              @id @default(uuid())
  userId            String              @map("user_id")
  accountId         String              @map("account_id")
  categoryId        String              @map("category_id")
  name              String
  amount            BigInt
  type              TransactionType     @default(EXPENSE)
  frequency         RecurrenceFrequency @default(MONTHLY)
  startDate         DateTime            @map("start_date")
  endDate           DateTime?           @map("end_date")
  nextExecutionDate DateTime            @map("next_execution_date")
  isActive          Boolean             @default(true) @map("is_active")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  account           Account             @relation(fields: [accountId], references: [id])
  category          Category            @relation(fields: [categoryId], references: [id])
  subscriptions     Subscription[]

  @@index([userId, nextExecutionDate])
  @@map("recurring_transactions")
}

model Subscription {
  id                     String                @id @default(uuid())
  userId                 String                @map("user_id")
  recurringTransactionId String?               @map("recurring_transaction_id")
  name                   String
  amount                 BigInt
  billingCycle           RecurrenceFrequency   @default(MONTHLY) @map("billing_cycle")
  nextBillingDate        DateTime              @map("next_billing_date")
  isActive               Boolean               @default(true) @map("is_active")
  createdAt              DateTime              @default(now()) @map("created_at")
  updatedAt              DateTime              @updatedAt @map("updated_at")

  user                   User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  recurringTransaction   RecurringTransaction? @relation(fields: [recurringTransactionId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@map("subscriptions")
}
```

---

## 4. API Specification

All endpoints enforce JWT Bearer Token authentication (except public auth endpoints).

### 4.1 Auth Module (`/api/v1/auth`)
- `POST /auth/register` - Create user account.
- `POST /auth/login` - Authenticate, return access token & HTTP-only refresh cookie.
- `POST /auth/refresh` - Refresh access token using cookie.
- `POST /auth/logout` - Clear refresh cookie & invalidate token session.

### 4.2 Account Module (`/api/v1/accounts`)
- `GET /accounts` - List all accounts with current balances.
- `POST /accounts` - Create account.
- `GET /accounts/:id` - Fetch account details.
- `PATCH /accounts/:id` - Update account metadata.
- `DELETE /accounts/:id` - Soft delete/deactivate account.

### 4.3 Transaction Module (`/api/v1/transactions`)
- `GET /transactions` - Paginated transaction query (filters: `search`, `startDate`, `endDate`, `categoryId`, `accountId`, `type`, `page`, `limit`, `sortBy`, `sortOrder`).
- `POST /transactions` - Create transaction (EXPENSE, INCOME, TRANSFER, REFUND). Automatically updates account balances inside a database transaction.
- `GET /transactions/:id` - Fetch single transaction detail.
- `PATCH /transactions/:id` - Update transaction & re-synchronize account balance.
- `DELETE /transactions/:id` - Soft delete transaction & revert balance effect.

### 4.4 Budget Module (`/api/v1/budgets`)
- `GET /budgets` - Fetch budgets with current period spending & threshold status (`NORMAL`, `WARNING`, `CRITICAL`, `EXCEEDED`).
- `POST /budgets` - Create budget for category.
- `PATCH /budgets/:id` - Update budget amount/period.
- `DELETE /budgets/:id` - Delete budget.

### 4.5 Savings Goal & Plan Module (`/api/v1/saving-goals`)
- `GET /saving-goals` - List active and completed savings goals.
- `POST /saving-goals` - Create goal.
- `GET /saving-goals/:id` - Fetch goal & associated savings plan.
- `POST /saving-goals/:id/plan` - Generate savings plan (Conservative, Balanced, Aggressive options).
- `POST /saving-goals/:id/contributions` - Record savings contribution.

### 4.6 Dashboard & Engine Module (`/api/v1/dashboard`)
- `GET /dashboard` - Aggregated KPIs: Net Balance, Monthly Income/Expense/Savings, Safe-to-Spend, Daily Safe Spending, Budget Progress, Recent Transactions, Cashflow Chart.

### 4.7 Analytics & Insights (`/api/v1/analytics`, `/api/v1/insights`)
- `GET /analytics/overview` - Monthly cash flow trends & period comparison.
- `GET /analytics/categories` - Category breakdown pie/bar data.
- `GET /insights` - Rule-based financial notifications & category reduction recommendations.
- `GET /financial-health` - 0-100 score + detailed breakdown metrics.

---

## 5. UI/UX Specification

### 5.1 Responsive Layout System
- **Desktop (≥ 1280px)**: Collapsible Left Sidebar + Sticky Top Header + Main Content Grid.
- **Tablet (768px - 1279px)**: Compact Left Navigation Bar + Fluid Main Grid.
- **Mobile (< 768px)**: Top Header (Logo + Avatar) + Scrollable Workspace + Floating Action Button (`+` Quick Expense/Income/Transfer) + Sticky Bottom Navigation Bar (`Home`, `Transactions`, `Savings`, `Analytics`, `More`).

### 5.2 Core Views
1. **Onboarding Wizard**: 5 step quick setup flow modal/page after sign up.
2. **Dashboard**: Highlighted KPI cards (Current Balance, Safe To Spend badge with daily allowance highlight, Income/Expense summary, Budget warnings, Savings goals progress).
3. **Transaction Hub**: Data table with server-side pagination, search bar, multi-select category filters, date range picker, and transaction form drawer/modal.
4. **Savings Planner**: Goal creation wizard with interactive strategy slider (Conservative vs Balanced vs Aggressive) showing completion timeline previews.

---

## 6. Financial Calculation Specification (Mathematical Formulas)

### Formula 1: Account Balance Synchronization
$$\text{Current Balance} = \text{Initial Balance} + \sum \text{Income} - \sum \text{Expense} + \sum \text{Transfers In} - \sum \text{Transfers Out} + \sum \text{Refunds}$$

### Formula 2: Monthly Income & Expense
$$\text{Monthly Income} = \sum_{t \in \text{Incomes in month}} \text{Amount}(t)$$
$$\text{Monthly Expenses} = \left(\sum_{t \in \text{Expenses in month}} \text{Amount}(t)\right) - \left(\sum_{r \in \text{Refunds in month}} \text{Amount}(r)\right)$$
*(Note: Account-to-Account Transfers produce Net Change = 0 for total wealth).*

### Formula 3: Savings Rate
$$\text{Savings Rate (\%)} = \frac{\text{Monthly Income} - \text{Monthly Expenses}}{\text{Monthly Income}} \times 100\%$$

### Formula 4: Historical Saving Capacity (3-6 Month Window)
$$\text{Saving Capacity}_{\text{monthly}} = \text{Avg Monthly Income (3-6m)} - \text{Avg Monthly Expenses (3-6m)}$$

### Formula 5: Required Monthly Savings for Goal
$$\text{Required Monthly Savings} = \frac{\text{Target Amount} - \text{Current Amount}}{\max\left(1, \text{Months Remaining Until Target Date}\right)}$$

### Formula 6: Safe To Spend (Monthly & Daily Dynamic)
$$\text{Safe To Spend}_{\text{month}} = \text{Monthly Income} - \text{Fixed Recurring Expenses} - \text{Planned Savings Target}$$
$$\text{Daily Safe Spend} = \frac{\text{Safe To Spend}_{\text{month}} - \text{Spent So Far This Month}}{\text{Days Remaining In Month}}$$

### Formula 7: Savings Forecast Completion Date
$$\text{Months to Goal Completion} = \frac{\text{Target Amount} - \text{Current Amount}}{\text{Historical Average Monthly Savings}}$$
$$\text{Forecasted Date} = \text{Current Date} + \text{Months to Goal Completion}$$

### Formula 8: Financial Health Score (0 - 100)
Composed of 5 weighted metrics:
1. **Savings Rate Metric (30 pts)**: $>30\% \rightarrow 30\text{p}$; $20-30\% \rightarrow 20\text{p}$; $10-20\% \rightarrow 10\text{p}$; $<10\% \rightarrow 0\text{p}$.
2. **Budget Adherence Metric (25 pts)**: 0 exceeded budgets $\rightarrow 25\text{p}$; 1 exceeded $\rightarrow 15\text{p}$; $>1$ exceeded $\rightarrow 0\text{p}$.
3. **Emergency Fund Buffer (20 pts)**: $\frac{\text{Total Liquid Balance}}{\text{Avg Monthly Expenses}} \ge 3 \text{ months} \rightarrow 20\text{p}$.
4. **Expense Stability (15 pts)**: Month-over-month variance $<15\% \rightarrow 15\text{p}$.
5. **Safe To Spend Margin (10 pts)**: Daily safe spend $> 0 \rightarrow 10\text{p}$.

---

## 7. Implementation Roadmap

### Phase 0: Project Setup & Infrastructure
- Initialize Turborepo monorepo (`apps/web`, `apps/api`, `packages/shared`).
- Configure Docker Compose (`postgres:16`, `redis:7`).
- Setup Prisma ORM, migrations, and shared TypeScript models/DTOs.

### Phase 1: Authentication & Onboarding
- NestJS JWT Auth service + Passport strategy.
- Next.js Auth pages + protected middleware route handling.
- Onboarding step wizard UI.

### Phase 2: Accounts, Categories & Core Transactions
- Account CRUD + atomic balance update transactions in Prisma.
- Hierarchical category seed & CRUD.
- Transaction CRUD (Expense, Income, Transfer, Refund) with validation & soft deletes.

### Phase 3: Dashboard & Formatting System
- Centralized Currency (`FormatVND`, `FormatMoney`) & Date utilities (`Asia/Ho_Chi_Minh`).
- Dashboard widgets & Recharts cash flow visualization.

### Phase 4: Budget Management System
- Budget creation & spending tracker service.
- Budget progress bars with threshold color indicators (<70%, 70-89%, ≥90%, >100%).

### Phase 5 & 6: Savings Goals & Planning Engine
- Goal creation & contribution tracking.
- Historical saving capacity calculation & Conservative/Balanced/Aggressive strategy planner.

### Phase 7 & 8: Safe To Spend & Deterministic Insights
- Dynamic monthly & daily Safe To Spend engine.
- Rule-based financial health scoring & spending reduction recommendations.

### Phase 9 & 10: Analytics, Recurring & Subscriptions
- Analytics breakdown views & period comparison charts.
- Recurring transaction cron processor via BullMQ / Redis.

### Phase 11: Polish, Accessibility & Testing
- Skeleton loaders, empty states, ARIA accessibility compliance.
- Unit testing for calculation formulas & E2E integration test suite.

---

## 8. Risk Analysis & Risk Mitigation

| Risk | Potential Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Floating-Point Precision Errors** | Incorrect money totals & financial inaccuracies | Store all amounts as 64-bit integer minor units (`BigInt` / `int8` in PostgreSQL). Never use JS `float` for money math. |
| **Account Balance Synchronization Drift** | Balance doesn't match transaction sum | Wrap all transaction creations, edits, and deletions in database ACID transactions (`prisma.$transaction`). Run periodic balance auditing queries. |
| **Transfer Distortions in Expense Analytics** | Transfers falsely inflating monthly expense reports | Explicitly exclude transaction type `TRANSFER` from all expense & income aggregation calculations. |
| **Timezone Mismatches on Date Boundaries** | Transactions counted in wrong month | Store all timestamps in UTC ISO 8601 format; perform date range grouping explicitly in user timezone (`Asia/Ho_Chi_Minh`). |
| **Duplicate Recurring Payments** | Duplicate expenses generated by cron jobs | Idempotent background job execution using unique composite keys `(recurring_id, target_date)` and Redis locks. |

