export type AccountType = 'BANK' | 'CASH' | 'EWALLET' | 'CREDIT_CARD' | 'SAVINGS' | 'OTHER';

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'REFUND';

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export type SavingStrategy = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
  defaultCurrency: string;
  timezone: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthResponseData {
  user: UserDto;
  accessToken: string;
}

export interface CashFlowChartItem {
  month: string;
  income: number;
  expense: number;
  netSavings: number;
}

export interface DashboardOverviewDto {
  netBalance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySavings: string;
  safeToSpend: string;
  dailySafeSpend: string;
  recentTransactions: Array<{
    id: string;
    accountName: string;
    categoryName: string;
    type: TransactionType;
    amount: string;
    transactionDate: string;
    note?: string;
  }>;
  cashFlowTrend: CashFlowChartItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
