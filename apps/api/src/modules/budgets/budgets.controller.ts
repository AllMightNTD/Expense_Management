import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const result = await this.budgetsService.create(req.user.userId, {
      categoryId: body.categoryId,
      amount: BigInt(body.amount || 0),
      period: body.period,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    return { success: true, data: result };
  }

  @Get()
  async findAll(@Req() req: any) {
    const result = await this.budgetsService.findAll(req.user.userId);
    return { success: true, data: result };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const result = await this.budgetsService.remove(req.user.userId, id);
    return { success: true, data: result };
  }
}
