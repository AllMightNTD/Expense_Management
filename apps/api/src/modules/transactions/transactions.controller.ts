import { Controller, Get, Post, Body, Query, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const result = await this.transactionsService.create(req.user.userId, {
      accountId: body.accountId,
      categoryId: body.categoryId,
      type: body.type,
      amount: BigInt(body.amount || 0),
      currency: body.currency,
      transactionDate: body.transactionDate,
      note: body.note,
      transferToAccountId: body.transferToAccountId,
      originalTransactionId: body.originalTransactionId,
    });
    return { success: true, data: result };
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    const result = await this.transactionsService.findAll(req.user.userId, query);
    return { success: true, data: result.items, meta: result.meta };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const result = await this.transactionsService.remove(req.user.userId, id);
    return { success: true, data: result };
  }
}
