import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PublicModule } from './public/public.module';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'public',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    PublicModule,
    RegistrationsModule,
    AdminModule,
  ],
})
export class AppModule {}
