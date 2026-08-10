import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { InsightsModule } from './modules/insights/insights.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    InsightsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
