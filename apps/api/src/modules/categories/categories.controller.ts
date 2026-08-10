import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Req() req: any) {
    const result = await this.categoriesService.findAll(req.user.userId);
    return { success: true, data: result };
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const result = await this.categoriesService.create(req.user.userId, body);
    return { success: true, data: result };
  }
}
