import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const result = await this.accountsService.create(req.user.userId, {
      name: body.name,
      type: body.type,
      currency: body.currency,
      initialBalance: BigInt(body.initialBalance || 0),
    });
    return { success: true, data: result };
  }

  @Get()
  async findAll(@Req() req: any) {
    const result = await this.accountsService.findAllByUser(req.user.userId);
    return { success: true, data: result };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const result = await this.accountsService.findOne(req.user.userId, id);
    return { success: true, data: result };
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const result = await this.accountsService.update(req.user.userId, id, body);
    return { success: true, data: result };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const result = await this.accountsService.remove(req.user.userId, id);
    return { success: true, data: result };
  }
}
