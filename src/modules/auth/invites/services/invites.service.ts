import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../../../config/config.service.js';
import type { Invite } from '../../../../generated/prisma/client.js';
import { EmailService } from '../../../../integrations/email/email.service.js';
import { hashPassword } from '../../../../shared/crypto/password.js';
import {
  generateToken,
  hashToken,
} from '../../../../shared/crypto/token-hash.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { toUserDto } from '../../../users/accounts/dto/user.dto.js';
import {
  AccountsService,
  normaliseEmail,
} from '../../../users/accounts/services/accounts.service.js';
import type { SessionDto } from '../../login/dto/session.dto.js';
import { TokensService } from '../../login/services/tokens.service.js';
import type {
  AcceptInviteBody,
  CreateInviteBody,
  InviteDto,
} from '../dto/invites.dto.js';
import { InvitesRepository } from '../repositories/invites.repository.js';

export const INVITE_DAYS = 7;

function toInviteDto(invite: Invite): InviteDto {
  return {
    id: invite.id,
    email: invite.email,
    name: invite.name,
    expiresAt: invite.expiresAt.toISOString(),
  };
}

@Injectable()
export class InvitesService {
  constructor(
    private readonly repository: InvitesRepository,
    private readonly accounts: AccountsService,
    private readonly tokens: TokensService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async create(
    invitedById: string | null,
    body: CreateInviteBody,
    now = new Date(),
  ): Promise<InviteDto> {
    const email = normaliseEmail(body.email);
    if (await this.accounts.findByEmail(email))
      throw new AppError(AUTH_ERRORS.INVITE_EMAIL_TAKEN);

    const token = generateToken();
    const invite = await this.repository.replace(
      {
        email,
        name: body.name.trim(),
        tokenHash: hashToken(token),
        invitedById,
        expiresAt: new Date(now.getTime() + INVITE_DAYS * 86_400_000),
      },
      now,
    );
    const link = `${this.config.get('APP_LINK_BASE')}researcher/accept-invite?token=${token}`;
    await this.email.send({
      to: email,
      subject: 'You’re invited to ThriveCBT',
      text: `Hello ${invite.name},\n\nYou’ve been invited to join ThriveCBT as a researcher. Open this link on the phone where the ThriveCBT app is installed to set your password:\n\n${link}\n\nThe link works for ${INVITE_DAYS} days.`,
    });
    return toInviteDto(invite);
  }

  async accept(
    { token, password }: AcceptInviteBody,
    now = new Date(),
  ): Promise<SessionDto> {
    const invite = await this.repository.findByHash(hashToken(token));
    if (!invite || invite.acceptedAt || invite.revokedAt)
      throw new AppError(AUTH_ERRORS.INVITE_INVALID);
    if (invite.expiresAt <= now) throw new AppError(AUTH_ERRORS.INVITE_EXPIRED);
    if (await this.accounts.findByEmail(invite.email))
      throw new AppError(AUTH_ERRORS.INVITE_EMAIL_TAKEN);
    if (!(await this.repository.markAccepted(invite.id, now)))
      throw new AppError(AUTH_ERRORS.INVITE_INVALID);

    const user = await this.accounts.createResearcher(
      {
        email: invite.email,
        passwordHash: await hashPassword(password),
        name: invite.name,
      },
      now,
    );
    return { user: toUserDto(user), ...(await this.tokens.issue(user)) };
  }
}
