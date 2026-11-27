import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { ConfigModule } from './config/config.module.js';
import { ConfigService } from './config/config.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RATE_LIMIT } from './shared/constants/rate-limits.js';
import { CryptoModule } from './shared/crypto/crypto.module.js';
import { AllExceptionsFilter } from './shared/errors/all-exceptions.filter.js';
import { AuthGuard } from './shared/guards/auth.guard.js';
import { RolesGuard } from './shared/guards/roles.guard.js';
import { loggingConfig } from './shared/logging/logging.config.js';

const ACCESS_TOKEN_TTL = '15m';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: loggingConfig,
    }),
    ThrottlerModule.forRoot([RATE_LIMIT]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL },
      }),
    }),
    PrismaModule,
    CryptoModule,
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
