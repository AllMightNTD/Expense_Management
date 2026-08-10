# System Architecture Specification

> **Project:** Personal Finance & Savings Management Platform  
> **Version:** 2.1  

---

## 1. Top-Level Monorepo Topology
The monorepo is managed via **Turborepo** and **`pnpm` workspaces**:

```
apps/
├── web/                   # Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
└── api/                   # NestJS 10, Passport JWT, Prisma ORM 5.22, Redis 7, BullMQ, Swagger

packages/
├── shared/                # DTO contracts, Zod schemas, Enums, Types (Zero business logic)
├── eslint-config/         # ESLint presets
└── typescript-config/     # tsconfig baselines
```

---

## 2. NestJS Domain Modules (`apps/api/src/`)
- `auth/` & `users/`: Passport JWT authentication, DB session storage (`sessions` table), user profiles, and timezone preferences.
- `accounts/`: Multi-account management, initial balances, and `BalanceReconciliationService`.
- `categories/`: Income & Expense category trees with system categories (`isSystem = true`).
- `transactions/`: Transaction Ledger (`INCOME`, `EXPENSE`, `TRANSFER`) with ACID atomic balance synchronization.
- `transfers/`: Atomic inter-account money movements linking source and destination transaction entries.
- `financial/`: Core Financial Calculation Engine (`calculators/`, `policies/`, `reconciliation/`).
- `budgets/`: Category-level budget usage tracking.
- `savings/` & `savings-planning/`: Savings goals, contribution ledgers, goal feasibility calculators, and savings strategy policies (`CONSERVATIVE`, `BALANCED`, `AGGRESSIVE`).
- `analytics/`: Cash flow trends, category expense breakdowns, and monthly summaries.
- `insights/`: Financial insight generator.
- `recurring/` & `subscriptions/`: Automated transaction execution rules and subscription tracking.
- `audit/`: Financial mutation audit trail (`audit_logs`).

---

## 3. Financial Engine Core Isolation
All financial metrics are computed strictly by pure calculators in `apps/api/src/modules/financial/calculators/`:
- `balance.calculator.ts`
- `income.calculator.ts`
- `expense.calculator.ts`
- `savings.calculator.ts`
- `savings-rate.calculator.ts`
- `savings-capacity.calculator.ts`
- `safe-to-spend.calculator.ts`
- `daily-safe-spend.calculator.ts`
- `goal-forecast.calculator.ts`
- `financial-health.calculator.ts`
