import { Module } from '@nestjs/common';

import { EmailModule } from '../../integrations/email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { EmailCodesRepository } from './email-codes/repositories/email-codes.repository.js';
import { EmailCodesService } from './email-codes/services/email-codes.service.js';
import { InvitesController } from './invites/controllers/invites.controller.js';
import { InvitesRepository } from './invites/repositories/invites.repository.js';
import { InvitesService } from './invites/services/invites.service.js';
import { LoginController } from './login/controllers/login.controller.js';
import { RefreshTokensRepository } from './login/repositories/refresh-tokens.repository.js';
import { LoginService } from './login/services/login.service.js';
import { TokensService } from './login/services/tokens.service.js';
import { PasswordResetController } from './password-reset/controllers/password-reset.controller.js';
import { PasswordResetService } from './password-reset/services/password-reset.service.js';
import { VerifyEmailController } from './verify-email/controllers/verify-email.controller.js';
import { VerifyEmailService } from './verify-email/services/verify-email.service.js';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [
    LoginController,
    VerifyEmailController,
    PasswordResetController,
    InvitesController,
  ],
  providers: [
    LoginService,
    TokensService,
    RefreshTokensRepository,
    EmailCodesService,
    EmailCodesRepository,
    VerifyEmailService,
    PasswordResetService,
    InvitesService,
    InvitesRepository,
  ],
  exports: [TokensService],
})
export class AuthModule {}
