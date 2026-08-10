import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string; type: AccountType; currency?: string; initialBalance: bigint }) {
    return this.prisma.account.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        currency: data.currency || 'VND',
        initialBalance: data.initialBalance,
        currentBalance: data.initialBalance,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!account) throw new NotFoundException('Tài khoản không tồn tại');
    return account;
  }

  async update(userId: string, id: string, data: { name?: string; type?: AccountType; currency?: string }) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
