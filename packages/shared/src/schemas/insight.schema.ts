export interface CategorySpendingBreakdown {
  categoryName: string;
  categoryColor: string;
  totalSpent: string;
  percentage: number;
}

export interface ExpenseReductionAdvice {
  categoryName: string;
  currentMonthlySpent: string;
  suggestedMonthlySpent: string;
  potentialSavings: string;
  tip: string;
}

export interface GoalProjectionDto {
  goalId: string;
  goalName: string;
  remainingAmount: string;
  monthlySavingsRate: string;
  estimatedMonthsRemaining: number;
  projectedCompletionDate: string;
}

export interface FinancialInsightDto {
  healthScore: number;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
  categoryBreakdown: CategorySpendingBreakdown[];
  reductionAdvice: ExpenseReductionAdvice[];
  goalProjections: GoalProjectionDto[];
}

export function calculateGoalCompletionMonths(remaining: bigint, monthlySavings: bigint): number {
  if (monthlySavings <= BigInt(0)) return 999;
  return Math.ceil(Number(remaining) / Number(monthlySavings));
}
