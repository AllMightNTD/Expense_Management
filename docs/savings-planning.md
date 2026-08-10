# Savings Planning & Strategy Specification

> **Project:** Personal Finance & Savings Management Platform  
> **Domain Layer:** `apps/api/src/modules/savings-planning/`  

---

## 1. Savings Strategy Policies (`savings-strategy.policy.ts`)

Users can configure or recalculate their goal plans based on 3 distinct behavioral strategies:

### 1. Conservative Strategy (`CONSERVATIVE`)
- **Target Saving Rate**: 20% of monthly income.
- **Safety Buffer**: High buffer (15% of monthly disposable income).
- **Priority**: Financial safety & emergency coverage over fast goal completion.

### 2. Balanced Strategy (`BALANCED` - Default)
- **Target Saving Rate**: 30% of monthly income.
- **Safety Buffer**: Moderate buffer (10% of monthly disposable income).
- **Priority**: Equal balance between lifestyle spending and target savings.

### 3. Aggressive Strategy (`AGGRESSIVE`)
- **Target Saving Rate**: 50% of monthly income.
- **Safety Buffer**: Low buffer (5% of monthly disposable income).
- **Priority**: Fast-track savings goal completion by minimizing discretionary spending.

---

## 2. Emergency Fund Modeling
- Emergency Funds are designated via `savings_goals.goalType = EMERGENCY_FUND`.
- `EmergencyFundScore` measures the total balance of active `EMERGENCY_FUND` goals divided by 3-to-6-month average essential expenses:
  $$\text{EmergencyFundMonths} = \frac{\text{Sum of Emergency Goal Balances}}{\text{Average Monthly Essential Expenses}}$$
  - 6+ months: 100 points
  - 3–5 months: 75 points
  - 1–2 months: 40 points
  - <1 month: 10 points
