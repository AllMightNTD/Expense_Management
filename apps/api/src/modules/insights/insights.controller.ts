import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  async getInsights(@Req() req: any) {
    const result = await this.insightsService.getInsights(req.user.userId);
    return { success: true, data: result };
  }
}
