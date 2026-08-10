import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    BudgetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
