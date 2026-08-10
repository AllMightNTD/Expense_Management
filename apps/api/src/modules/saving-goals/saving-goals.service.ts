import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoalPriority, GoalStatus } from '@prisma/client';
import { formatVND, calculateGoalProgress } from '@expense/shared';

@Injectable()
export class SavingGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: {
    name: string;
    targetAmount: bigint;
    initialAmount?: bigint;
    targetDate: string;
    priority?: GoalPriority;
  }) {
    const currentAmount = data.initialAmount || BigInt(0);
    const targetDate = new Date(data.targetDate);
    const status = currentAmount >= data.targetAmount ? GoalStatus.COMPLETED : GoalStatus.ACTIVE;

    return this.prisma.savingGoal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount,
        targetDate,
        priority: data.priority || GoalPriority.MEDIUM,
        status,
      },
    });
  }

  async findAll(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return goals.map((g) => {
      const progressPercentage = calculateGoalProgress(g.currentAmount, g.targetAmount);
      const remainingAmountBigInt = g.targetAmount > g.currentAmount ? g.targetAmount - g.currentAmount : BigInt(0);

      return {
        id: g.id,
        name: g.name,
        targetAmount: formatVND(g.targetAmount),
        currentAmount: formatVND(g.currentAmount),
        remainingAmount: formatVND(remainingAmountBigInt),
        progressPercentage,
        priority: g.priority,
        status: g.status,
        targetDate: g.targetDate.toISOString().split('T')[0],
        contributionsCount: g.contributions.length,
      };
    });
  }

  async recordContribution(userId: string, goalId: string, data: {
    amount: bigint;
    transactionId?: string;
    note?: string;
  }) {
    const goal = await this.prisma.savingGoal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) throw new NotFoundException('Mục tiêu tiết kiệm không tồn tại');

    return this.prisma.$transaction(async (tx) => {
      const contribution = await tx.savingContribution.create({
        data: {
          savingGoalId: goalId,
          amount: data.amount,
          transactionId: data.transactionId,
          note: data.note,
        },
      });

      const updatedCurrentAmount = goal.currentAmount + data.amount;
      const isCompleted = updatedCurrentAmount >= goal.targetAmount;

      await tx.savingGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: updatedCurrentAmount,
          status: isCompleted ? GoalStatus.COMPLETED : goal.status,
        },
      });

      return contribution;
    });
  }
}
