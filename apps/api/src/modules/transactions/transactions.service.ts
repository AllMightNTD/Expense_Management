import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: {
    accountId: string;
    categoryId?: string;
    type: TransactionType;
    amount: bigint;
    currency?: string;
    transactionDate?: string;
    note?: string;
    transferToAccountId?: string;
    originalTransactionId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify account ownership
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId, isActive: true },
      });
      if (!account) throw new NotFoundException('Tài khoản nguồn không tồn tại');

      if (data.type === TransactionType.TRANSFER) {
        if (!data.transferToAccountId) {
          throw new BadRequestException('Chuyển khoản yêu cầu chọn tài khoản đích');
        }
        const targetAccount = await tx.account.findFirst({
          where: { id: data.transferToAccountId, userId, isActive: true },
        });
        if (!targetAccount) throw new NotFoundException('Tài khoản đích không tồn tại');
      }

      // 2. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          currency: data.currency || 'VND',
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
          note: data.note,
          transferFromAccountId: data.type === TransactionType.TRANSFER ? data.accountId : undefined,
          transferToAccountId: data.transferToAccountId,
          originalTransactionId: data.originalTransactionId,
        },
      });

      // 3. Update account balances atomically
      if (data.type === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { currentBalance: { decrement: data.amount } },
        });
      } else if (data.type === TransactionType.INCOME || data.type === TransactionType.REFUND) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { currentBalance: { increment: data.amount } },
        });
      } else if (data.type === TransactionType.TRANSFER && data.transferToAccountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { currentBalance: { decrement: data.amount } },
        });
        await tx.account.update({
          where: { id: data.transferToAccountId },
          data: { currentBalance: { increment: data.amount } },
        });
      }

      return transaction;
    });
  }

  async findAll(userId: string, query: {
    search?: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: TransactionType;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.accountId) where.accountId = query.accountId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.note = { contains: query.search, mode: 'insensitive' };
    }
    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate);
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          account: true,
          category: true,
          transferToAccount: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id, userId, deletedAt: null },
      });
      if (!transaction) throw new NotFoundException('Giao dịch không tồn tại');

      // Revert account balance effect
      if (transaction.type === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { currentBalance: { increment: transaction.amount } },
        });
      } else if (transaction.type === TransactionType.INCOME || transaction.type === TransactionType.REFUND) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { currentBalance: { decrement: transaction.amount } },
        });
      } else if (transaction.type === TransactionType.TRANSFER && transaction.transferToAccountId) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { currentBalance: { increment: transaction.amount } },
        });
        await tx.account.update({
          where: { id: transaction.transferToAccountId },
          data: { currentBalance: { decrement: transaction.amount } },
        });
      }

      return tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }
}
