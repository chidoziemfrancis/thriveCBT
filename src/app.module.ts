import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { ConfigModule } from './config/config.module.js';
import { ConfigService } from './config/config.service.js';
import { AlertsModule } from './modules/alerts/alerts.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';
import { AssignmentModule } from './modules/assignment/assignment.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { BeliefsModule } from './modules/beliefs/beliefs.module.js';
import { JournalModule } from './modules/journal/journal.module.js';
import { MoodModule } from './modules/mood/mood.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { ThoughtsModule } from './modules/thoughts/thoughts.module.js';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RATE_LIMIT } from './shared/constants/rate-limits.js';
import { CryptoModule } from './shared/crypto/crypto.module.js';
import { AllExceptionsFilter } from './shared/errors/all-exceptions.filter.js';
import { AuthGuard } from './shared/guards/auth.guard.js';
import { RolesGuard } from './shared/guards/roles.guard.js';
import { StudyGuard } from './shared/guards/study.guard.js';
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
    EventEmitterModule.forRoot(),
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
    AssignmentModule,
    AlertsModule,
    AssessmentsModule,
    WithdrawalModule,
    SessionsModule,
    MoodModule,
    JournalModule,
    ThoughtsModule,
    BeliefsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: StudyGuard },
  ],
})
export class AppModule {}
