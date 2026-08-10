import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultCategories();
  }

  async seedDefaultCategories() {
    const count = await this.prisma.category.count({ where: { isDefault: true } });
    if (count > 0) return;

    const defaults = [
      { name: 'Ăn uống', icon: 'utensils', color: '#ef4444', type: TransactionType.EXPENSE },
      { name: 'Nhà ở', icon: 'home', color: '#3b82f6', type: TransactionType.EXPENSE },
      { name: 'Đi lại', icon: 'car', color: '#f59e0b', type: TransactionType.EXPENSE },
      { name: 'Mua sắm', icon: 'shopping-bag', color: '#ec4899', type: TransactionType.EXPENSE },
      { name: 'Giải trí', icon: 'film', color: '#8b5cf6', type: TransactionType.EXPENSE },
      { name: 'Sức khỏe', icon: 'activity', color: '#10b981', type: TransactionType.EXPENSE },
      { name: 'Giáo dục', icon: 'book', color: '#6366f1', type: TransactionType.EXPENSE },
      { name: 'Lương', icon: 'dollar-sign', color: '#22c55e', type: TransactionType.INCOME },
      { name: 'Thưởng', icon: 'gift', color: '#06b6d4', type: TransactionType.INCOME },
    ];

    for (const cat of defaults) {
      await this.prisma.category.create({
        data: { ...cat, isDefault: true },
      });
    }
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, data: { name: string; icon?: string; color?: string; type: TransactionType; parentId?: string }) {
    return this.prisma.category.create({
      data: {
        userId,
        name: data.name,
        icon: data.icon || 'tag',
        color: data.color || '#10b981',
        type: data.type,
        parentId: data.parentId,
        isDefault: false,
      },
    });
  }
}
