# Dashboard Orchestration Specification

> **Project:** Personal Finance & Savings Management Platform  
> **API Endpoint:** `GET /api/v1/dashboard/overview`  

---

## 1. Orchestration Principle
The `DashboardService` is an **orchestrator only**. It aggregates results by invoking domain services (`FinancialEngineService`, `SafeToSpendService`, `CashFlowService`, `TransactionService`). It contains **ZERO** monetary formulas.

---

## 2. Dashboard Aggregation Payload

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-08-01",
      "to": "2026-08-31",
      "timezone": "Asia/Ho_Chi_Minh"
    },
    "summary": {
      "totalBalance": {
        "amount": "18500000.0000",
        "currency": "VND",
        "accountCount": 3
      },
      "income": {
        "amount": "25000000.0000",
        "currency": "VND"
      },
      "expense": {
        "amount": "8500000.0000",
        "currency": "VND"
      },
      "savings": {
        "amount": "16500000.0000",
        "currency": "VND",
        "savingRate": "0.6600"
      },
      "safeToSpend": {
        "amount": "5000000.0000",
        "currency": "VND",
        "status": "SAFE"
      },
      "dailySafeSpend": {
        "amount": "166666.0000",
        "currency": "VND",
        "remainingDays": 30
      }
    },
    "cashFlow": {
      "granularity": "month",
      "items": [
        {
          "period": "2026-08",
          "income": "25000000.0000",
          "expense": "8500000.0000",
          "net": "16500000.0000"
        }
      ]
    },
    "recentTransactions": []
  }
}
```
