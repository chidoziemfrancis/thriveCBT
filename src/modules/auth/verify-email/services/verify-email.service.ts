import { Injectable } from '@nestjs/common';

import {
  EmailCodePurpose,
  type User,
} from '../../../../generated/prisma/client.js';
import { EmailService } from '../../../../integrations/email/email.service.js';
import {
  type UserDto,
  toUserDto,
} from '../../../users/accounts/dto/user.dto.js';
import { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import {
  CODE_MINUTES,
  EmailCodesService,
} from '../../email-codes/services/email-codes.service.js';

@Injectable()
export class VerifyEmailService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly codes: EmailCodesService,
    private readonly email: EmailService,
  ) {}

  async sendCode(user: User): Promise<void> {
    if (user.emailVerifiedAt) return;
    const code = await this.codes.issue(user.id, EmailCodePurpose.VERIFY_EMAIL);
    await this.email.send({
      to: user.email,
      subject: 'Your ThriveCBT code',
      text: `Your code is ${code}. It works for ${CODE_MINUTES} minutes.\n\nIf you didn’t sign up for ThriveCBT, you can ignore this email.`,
    });
  }

  async resend(userId: string): Promise<void> {
    await this.sendCode(await this.accounts.getById(userId));
  }

  async verify(userId: string, code: string): Promise<UserDto> {
    const user = await this.accounts.getById(userId);
    if (user.emailVerifiedAt) return toUserDto(user);
    await this.codes.consume(user.id, EmailCodePurpose.VERIFY_EMAIL, code);
    return toUserDto(await this.accounts.markEmailVerified(user));
  }
}
