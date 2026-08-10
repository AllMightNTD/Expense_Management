import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BudgetPeriod, TransactionType } from '@prisma/client';
import { formatVND, calculateBudgetStatus } from '@expense/shared';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: {
    categoryId: string;
    amount: bigint;
    period?: BudgetPeriod;
    startDate?: string;
    endDate?: string;
  }) {
    const now = new Date();
    const startDate = data.startDate ? new Date(data.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = data.endDate ? new Date(data.endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period || BudgetPeriod.MONTHLY,
        startDate,
        endDate,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const results = [];
    for (const b of budgets) {
      // Calculate category expenses in budget date range
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          categoryId: b.categoryId,
          deletedAt: null,
          transactionDate: {
            gte: b.startDate,
            lte: b.endDate,
          },
        },
      });

      let spentBigInt = BigInt(0);
      for (const tx of transactions) {
        if (tx.type === TransactionType.EXPENSE) {
          spentBigInt += tx.amount;
        } else if (tx.type === TransactionType.REFUND) {
          spentBigInt -= tx.amount;
        }
      }
      if (spentBigInt < BigInt(0)) spentBigInt = BigInt(0);

      const remainingBigInt = b.amount > spentBigInt ? b.amount - spentBigInt : BigInt(0);
      const usagePercentage = Number(b.amount) > 0 ? Math.round((Number(spentBigInt) / Number(b.amount)) * 100) : 0;
      const status = calculateBudgetStatus(spentBigInt, b.amount);

      results.push({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category?.name || 'Khác',
        categoryColor: b.category?.color || '#10b981',
        categoryIcon: b.category?.icon || 'tag',
        budgetAmount: formatVND(b.amount),
        spentAmount: formatVND(spentBigInt),
        remainingAmount: formatVND(remainingBigInt),
        usagePercentage,
        status,
        period: b.period,
        startDate: b.startDate.toISOString().split('T')[0],
        endDate: b.endDate.toISOString().split('T')[0],
      });
    }

    return results;
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Ngân sách không tồn tại');

    return this.prisma.budget.delete({ where: { id } });
  }
}
