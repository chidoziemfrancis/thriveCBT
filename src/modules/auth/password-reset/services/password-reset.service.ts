import { Injectable } from '@nestjs/common';

import {
  EmailCodePurpose,
  UserStatus,
} from '../../../../generated/prisma/client.js';
import { EmailService } from '../../../../integrations/email/email.service.js';
import { hashPassword } from '../../../../shared/crypto/password.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import {
  CODE_MINUTES,
  EmailCodesService,
} from '../../email-codes/services/email-codes.service.js';
import { TokensService } from '../../login/services/tokens.service.js';
import type { ResetConfirmBody } from '../dto/password-reset.dto.js';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly codes: EmailCodesService,
    private readonly tokens: TokensService,
    private readonly email: EmailService,
  ) {}

  // Always succeeds, so nobody can use this to find out which emails have accounts.
  async request(email: string): Promise<void> {
    const user = await this.accounts.findByEmail(email);
    if (!user || user.status === UserStatus.SUSPENDED) return;
    const code = await this.codes.issue(
      user.id,
      EmailCodePurpose.RESET_PASSWORD,
    );
    // A failed send is logged by EmailService; answering the same way keeps accounts private.
    await this.email
      .send({
        to: user.email,
        subject: 'Reset your ThriveCBT password',
        text: `Your reset code is ${code}. It works for ${CODE_MINUTES} minutes.\n\nIf you didn’t ask to reset your password, you can ignore this email.`,
      })
      .catch(() => undefined);
  }

  async confirm({ email, code, password }: ResetConfirmBody): Promise<void> {
    const user = await this.accounts.findByEmail(email);
    if (!user) throw new AppError(AUTH_ERRORS.CODE_INVALID);
    await this.codes.consume(user.id, EmailCodePurpose.RESET_PASSWORD, code);
    await this.accounts.setPassword(user.id, await hashPassword(password));
    await this.tokens.revokeAllForUser(user.id);
  }
}
