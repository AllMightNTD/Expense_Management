import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { formatVND, calculateDailySafeSpend } from '@expense/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    // 1. Calculate Total Net Balance across all active user accounts
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
    });
    const netBalanceBigInt = accounts.reduce((acc, a) => acc + a.currentBalance, BigInt(0));

    // 2. Define Month Date Range (Current calendar month in Asia/Ho_Chi_Minh)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Days remaining in month
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

    // 3. Aggregate Monthly Transactions
    const monthTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let monthlyIncomeBigInt = BigInt(0);
    let monthlyExpenseBigInt = BigInt(0);

    for (const tx of monthTransactions) {
      if (tx.type === TransactionType.INCOME) {
        monthlyIncomeBigInt += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyExpenseBigInt += tx.amount;
      } else if (tx.type === TransactionType.REFUND) {
        monthlyExpenseBigInt -= tx.amount;
      }
    }

    if (monthlyExpenseBigInt < BigInt(0)) monthlyExpenseBigInt = BigInt(0);

    const monthlySavingsBigInt = monthlyIncomeBigInt - monthlyExpenseBigInt;
    const safeToSpendBigInt = monthlyIncomeBigInt > monthlyExpenseBigInt ? monthlyIncomeBigInt - monthlyExpenseBigInt : BigInt(0);
    const dailySafeSpendBigInt = calculateDailySafeSpend(safeToSpendBigInt, daysRemaining);

    // 4. Fetch 5 Latest Transactions for feed
    const recentTx = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { transactionDate: 'desc' },
      take: 5,
      include: {
        account: true,
        category: true,
      },
    });

    const recentTransactions = recentTx.map((t) => ({
      id: t.id,
      accountName: t.account.name,
      categoryName: t.category?.name || 'Khác',
      type: t.type,
      amount: formatVND(t.amount),
      transactionDate: t.transactionDate.toISOString().split('T')[0],
      note: t.note || undefined,
    }));

    // 5. Mock 6-month cashflow trend data
    const cashFlowTrend = [
      { month: 'T3', income: 14000000, expense: 8500000, netSavings: 5500000 },
      { month: 'T4', income: 15000000, expense: 9000000, netSavings: 6000000 },
      { month: 'T5', income: 14500000, expense: 8800000, netSavings: 5700000 },
      { month: 'T6', income: 16000000, expense: 9500000, netSavings: 6500000 },
      { month: 'T7', income: 15500000, expense: 8900000, netSavings: 6600000 },
      { month: 'T8', income: Number(monthlyIncomeBigInt), expense: Number(monthlyExpenseBigInt), netSavings: Number(monthlySavingsBigInt) },
    ];

    return {
      netBalance: formatVND(netBalanceBigInt),
      monthlyIncome: formatVND(monthlyIncomeBigInt),
      monthlyExpense: formatVND(monthlyExpenseBigInt),
      monthlySavings: formatVND(monthlySavingsBigInt),
      safeToSpend: formatVND(safeToSpendBigInt),
      dailySafeSpend: formatVND(dailySafeSpendBigInt),
      recentTransactions,
      cashFlowTrend,
    };
  }
}
