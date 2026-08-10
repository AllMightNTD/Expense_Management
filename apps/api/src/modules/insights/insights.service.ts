import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { formatVND, calculateGoalCompletionMonths } from '@expense/shared';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInsights(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch 30-day transactions
    const recentTx = await this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        transactionDate: { gte: thirtyDaysAgo },
      },
      include: { category: true },
    });

    let totalIncome = BigInt(0);
    let totalExpense = BigInt(0);
    const categoryTotals: Record<string, { name: string; color: string; amount: bigint }> = {};

    for (const tx of recentTx) {
      if (tx.type === TransactionType.INCOME) {
        totalIncome += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpense += tx.amount;
        const catName = tx.category?.name || 'Khác';
        const catColor = tx.category?.color || '#10b981';
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { name: catName, color: catColor, amount: BigInt(0) };
        }
        categoryTotals[catName].amount += tx.amount;
      }
    }

    // 2. Category Breakdown
    const categoryBreakdown = Object.values(categoryTotals).map((c) => ({
      categoryName: c.name,
      categoryColor: c.color,
      totalSpent: formatVND(c.amount),
      percentage: Number(totalExpense) > 0 ? Math.round((Number(c.amount) / Number(totalExpense)) * 100) : 0,
    }));

    // 3. Health Score Calculation (0-100)
    const savingsRate = Number(totalIncome) > 0 ? Math.max(0, (Number(totalIncome - totalExpense) / Number(totalIncome)) * 100) : 50;
    let healthScore = Math.min(100, Math.round(savingsRate * 1.2 + 20));
    if (healthScore < 0) healthScore = 20;

    let healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' = 'GOOD';
    if (healthScore >= 85) healthStatus = 'EXCELLENT';
    else if (healthScore >= 70) healthStatus = 'GOOD';
    else if (healthScore >= 50) healthStatus = 'FAIR';
    else healthStatus = 'NEEDS_ATTENTION';

    // 4. Expense Reduction Advice
    const sortedCategories = Object.values(categoryTotals).sort((a, b) => Number(b.amount - a.amount));
    const reductionAdvice = sortedCategories.slice(0, 3).map((cat) => {
      const suggested = (cat.amount * BigInt(80)) / BigInt(100);
      const savings = cat.amount - suggested;
      return {
        categoryName: cat.name,
        currentMonthlySpent: formatVND(cat.amount),
        suggestedMonthlySpent: formatVND(suggested),
        potentialSavings: formatVND(savings),
        tip: `Cắt giảm 20% chi tiêu nhóm ${cat.name} để tiết kiệm thêm ${formatVND(savings)} mỗi tháng.`,
      };
    });

    // 5. Goal Reach Date Projections
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const monthlySavingsRate = totalIncome > totalExpense ? totalIncome - totalExpense : BigInt(3000000);

    const goalProjections = goals.map((g) => {
      const remaining = g.targetAmount > g.currentAmount ? g.targetAmount - g.currentAmount : BigInt(0);
      const monthsRemaining = calculateGoalCompletionMonths(remaining, monthlySavingsRate);
      const completionDate = new Date();
      completionDate.setMonth(completionDate.getMonth() + monthsRemaining);

      return {
        goalId: g.id,
        goalName: g.name,
        remainingAmount: formatVND(remaining),
        monthlySavingsRate: formatVND(monthlySavingsRate),
        estimatedMonthsRemaining: monthsRemaining,
        projectedCompletionDate: completionDate.toISOString().split('T')[0],
      };
    });

    return {
      healthScore,
      healthStatus,
      categoryBreakdown,
      reductionAdvice,
      goalProjections,
    };
  }
}
