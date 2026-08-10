# Automated Testing Strategy & Verification Plan

> **Project:** Personal Finance & Savings Management Platform  
> **Test Frameworks:** Vitest (`@expense/shared`), Supertest (`@expense/api`), Next.js prerender static checks (`@expense/web`)  

---

## 1. Unit Test Coverage (`packages/shared` & Financial Calculators)
- **Financial Calculators**: 100% test coverage for:
  - `balance.calculator.ts`: Active vs archived accounts, `includeInTotalBalance` toggle.
  - `income.calculator.ts` & `expense.calculator.ts`: Date filtering per user timezone, exclusion of transfers.
  - `savings-rate.calculator.ts`: Handling `Income = 0` (returns `null`), zero division guards.
  - `safe-to-spend.calculator.ts`: Negative safe spend, zero remaining days, month boundary edge cases.
  - `goal-forecast.calculator.ts`: Target date in past, goal completed, overdue indicators.
  - `financial-health.calculator.ts`: 0–100 normalization across 5 components.

---

## 2. Integration & E2E Verification
- **Database ACID Transaction Rollback**: Verification that failed destination account updates during transfer roll back source account updates.
- **Balance Reconciliation Job**: Verification that `BalanceReconciliationService` identifies discrepancies between `accounts.currentBalance` and `transactions` sum.
- **Idempotency Key Verification**: Verification that re-submitting `POST /transactions` with identical `Idempotency-Key` returns `HTTP 200` without creating duplicate transactions.
- **Automated Script Execution**: `./scripts/test-all.sh` runs all unit tests, NestJS API build compilation, and Next.js static prerender build.
