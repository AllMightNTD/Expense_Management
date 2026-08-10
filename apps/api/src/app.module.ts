import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, AccountsModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
