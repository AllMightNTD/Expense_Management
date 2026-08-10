import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('saving-goals')
export class SavingGoalsController {
  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const result = await this.savingGoalsService.create(req.user.userId, {
      name: body.name,
      targetAmount: BigInt(body.targetAmount || 0),
      initialAmount: body.initialAmount ? BigInt(body.initialAmount) : BigInt(0),
      targetDate: body.targetDate,
      priority: body.priority,
    });
    return { success: true, data: result };
  }

  @Get()
  async findAll(@Req() req: any) {
    const result = await this.savingGoalsService.findAll(req.user.userId);
    return { success: true, data: result };
  }

  @Post(':id/contributions')
  async recordContribution(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const result = await this.savingGoalsService.recordContribution(req.user.userId, id, {
      amount: BigInt(body.amount || 0),
      transactionId: body.transactionId,
      note: body.note,
    });
    return { success: true, data: result };
  }
}
