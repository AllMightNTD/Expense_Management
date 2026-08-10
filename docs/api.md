# REST API Specification & Endpoint Registry

> **Project:** Personal Finance & Savings Management Platform  
> **Global Prefix:** `/api/v1`  
> **Authentication:** Bearer Access Token (JWT) + HTTP-only Refresh Cookie  

---

## 1. Response Standard Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Email hoặc mật khẩu không đúng"
  }
}
```

---

## 2. API Endpoint Registry

### Auth & Sessions (`/api/v1/auth`)
- `POST /auth/register` - Create user account
- `POST /auth/login` - Authenticate & generate tokens
- `POST /auth/refresh` - Refresh access token via HTTP-only cookie
- `POST /auth/logout` - Revoke session
- `POST /auth/logout-all` - Revoke all active user sessions
- `GET /auth/sessions` - List active sessions
- `DELETE /auth/sessions/:id` - Terminate session
- `GET /auth/me` - Get profile

### Accounts (`/api/v1/accounts`)
- `GET /accounts` - List active accounts
- `GET /accounts/:id` - Get account details
- `POST /accounts` - Create new source account
- `PATCH /accounts/:id` - Update account details
- `DELETE /accounts/:id` - Soft-delete account
- `GET /accounts/:id/balance` - Get materialized & expected balance
- `POST /accounts/:id/reconcile` - Reconcile stored vs expected balance

### Categories (`/api/v1/categories`)
- `GET /categories` - List categories
- `GET /categories/tree` - Get nested taxonomy tree
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Soft-delete category

### Transactions & Transfers (`/api/v1/transactions`)
- `GET /transactions` - Query transactions (paginated, filtered by date, type, account, category)
- `GET /transactions/recent` - Get top N recent transactions
- `GET /transactions/:id` - Get transaction details
- `POST /transactions` - Create transaction (Requires `Idempotency-Key`)
- `PATCH /transactions/:id` - Update transaction & calculate balance delta (Requires `Idempotency-Key`)
- `DELETE /transactions/:id` - Soft-delete transaction & reverse balance effect
- `POST /transactions/transfer` - Atomic inter-account transfer (Requires `Idempotency-Key`)

### Financial Engine (`/api/v1/financial`)
- `GET /financial/balance` - Total active account balance
- `GET /financial/income` - Period income
- `GET /financial/expense` - Period expense
- `GET /financial/savings` - Monthly savings & saving rate
- `GET /financial/savings-rate` - Saving rate (0–1 decimal or null)
- `GET /financial/saving-capacity` - Historical saving capacity
- `GET /financial/safe-to-spend` - Calculated Safe To Spend
- `GET /financial/daily-safe-spend` - Calculated Daily Safe Spend
- `GET /financial/health` - Normalized Financial Health Score (0–100)

### Budgets (`/api/v1/budgets`)
- `GET /budgets` - List budgets
- `GET /budgets/current` - Active period budget
- `GET /budgets/:id` - Get budget
- `POST /budgets` - Create budget
- `PATCH /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget
- `GET /budgets/:id/progress` - Budget spending progress

### Savings Hub (`/api/v1/savings`)
- `GET /savings/goals` - List savings goals
- `GET /savings/goals/:id` - Get goal details
- `POST /savings/goals` - Create goal
- `PATCH /savings/goals/:id` - Update goal
- `DELETE /savings/goals/:id` - Soft-delete goal
- `POST /savings/goals/:id/pause` - Pause goal lifecycle
- `POST /savings/goals/:id/resume` - Resume goal lifecycle
- `POST /savings/goals/:id/complete` - Mark goal completed
- `GET /savings/goals/:id/progress` - Goal accumulation progress
- `GET /savings/goals/:id/contributions` - List goal contributions
- `POST /savings/goals/:id/contributions` - Record goal contribution (Requires `Idempotency-Key`)
- `GET /savings/goals/:id/plan` - Savings strategy guidance plan
- `POST /savings/goals/:id/plan/recalculate` - Recalculate plan with new strategy

### Dashboard & Analytics (`/api/v1/dashboard`, `/api/v1/analytics`)
- `GET /dashboard/overview` - Aggregated dashboard overview KPI payload
- `GET /analytics/cash-flow` - Cash flow trend (Income vs Expense)
- `GET /analytics/expense-breakdown` - Category expense breakdown
- `GET /analytics/savings-trend` - Savings accumulation trend
- `GET /analytics/monthly-summary` - High-level monthly financial summary

### Insights & Automation (`/api/v1/insights`, `/api/v1/recurring`, `/api/v1/subscriptions`)
- `GET /insights` - List generated actionable insights
- `PATCH /insights/:id/read` - Mark insight read
- `POST /insights/generate` - Trigger insight generation job
- `GET /recurring` - List recurring transaction rules
- `POST /recurring` - Create recurring rule
- `GET /subscriptions` - List subscriptions
- `POST /subscriptions` - Create subscription
