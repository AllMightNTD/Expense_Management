# Financial Engine & Calculation Specification

> **Project:** Personal Finance & Savings Management Platform  
> **Canonical Domain Layer:** `apps/api/src/modules/financial/`  
> **Decimal Rule:** PostgreSQL `Decimal(18,4)` serialized as String  

---

## 1. Canonical Calculation Formulas

### 1.1 Total Balance
$$\text{TotalBalance} = \sum \text{currentBalance for active accounts where includeInTotalBalance = true}$$

### 1.2 Monthly Income & Monthly Expense
$$\text{MonthlyIncome} = \sum \text{amount for } \text{transactions where } \text{type} = \text{INCOME and } \text{deletedAt IS NULL}$$
$$\text{MonthlyExpense} = \sum \text{amount for } \text{transactions where } \text{type} = \text{EXPENSE and } \text{deletedAt IS NULL}$$

*Note: Inter-account `TRANSfers` are explicitly excluded from Income and Expense aggregations.*

### 1.3 Monthly Savings & Saving Rate
$$\text{MonthlySavings} = \text{MonthlyIncome} - \text{MonthlyExpense}$$
$$\text{SavingRate} = \frac{\text{MonthlyIncome} - \text{MonthlyExpense}}{\text{MonthlyIncome}} \quad (\text{null if Income} = 0)$$

### 1.4 Safe To Spend (Period & Daily)
$$\text{PeriodAvailableMoney} = \text{OpeningAvailableBalance} + \text{IncomeReceived} - \text{ActualExpense}$$
$$\text{SafeToSpend} = \text{PeriodAvailableMoney} - \text{RemainingFixedCommitments} - \text{RemainingPlannedSavings} - \text{SafetyBuffer}$$
$$\text{DailySafeSpend} = \frac{\text{SafeToSpend}}{\text{RemainingDaysInPeriod}}$$

*Status Indicators:*
- `SAFE`: $\text{SafeToSpend} > 0$
- `WARNING`: $\text{SafeToSpend} \le \text{SafetyBuffer}$
- `DANGER`: $\text{SafeToSpend} \le 0$

### 1.5 Required Monthly Saving & Goal Feasibility
$$\text{RequiredMonthlySaving} = \frac{\text{TargetAmount} - \text{CurrentAmount}}{\text{MonthsRemaining}}$$

*Feasibility Statuses:*
- `COMPLETED`: $\text{CurrentAmount} \ge \text{TargetAmount}$
- `FEASIBLE`: $\text{RequiredMonthlySaving} \le \text{HistoricalSavingCapacity}$
- `AT_RISK`: $\text{RequiredMonthlySaving} > \text{HistoricalSavingCapacity}$
- `UNFEASIBLE`: $\text{HistoricalSavingCapacity} \le 0$
- `OVERDUE`: $\text{TargetDate} < \text{CurrentDate}$ and $\text{CurrentAmount} < \text{TargetAmount}$

### 1.6 Financial Health Score (0–100)
$$\text{HealthScore} = (\text{SavingsRateScore} \times 0.30) + (\text{BudgetAdherenceScore} \times 0.25) + (\text{EmergencyFundScore} \times 0.20) + (\text{ExpenseStabilityScore} \times 0.15) + (\text{SafeSpendScore} \times 0.10)$$
