import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserStatus, type User } from '../../../../generated/prisma/client.js';
import {
  generateToken,
  hashToken,
} from '../../../../shared/crypto/token-hash.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { TokenPair } from '../dto/session.dto.js';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository.js';

export const REFRESH_TOKEN_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly repository: RefreshTokensRepository,
    private readonly accounts: AccountsService,
  ) {}

  async issue(
    user: Pick<User, 'id' | 'role'>,
    familyId: string = randomUUID(),
    now = new Date(),
  ): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role.toLowerCase(),
    });
    const refreshToken = generateToken();
    await this.repository.create({
      userId: user.id,
      familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_DAYS * DAY_MS),
    });
    return { accessToken, refreshToken };
  }

  async rotate(refreshToken: string, now = new Date()): Promise<TokenPair> {
    const record = await this.repository.findByHash(hashToken(refreshToken));
    if (!record) throw new AppError(AUTH_ERRORS.TOKEN_INVALID);

    if (record.revokedAt) {
      await this.repository.revokeFamily(record.familyId, now);
      throw new AppError(AUTH_ERRORS.TOKEN_REUSED);
    }
    if (record.expiresAt <= now) throw new AppError(AUTH_ERRORS.TOKEN_EXPIRED);

    // Two refreshes racing with the same token: only one can claim it, the other counts as reuse.
    if (!(await this.repository.revokeIfActive(record.id, now))) {
      await this.repository.revokeFamily(record.familyId, now);
      throw new AppError(AUTH_ERRORS.TOKEN_REUSED);
    }

    const user = await this.accounts.getById(record.userId);
    if (user.status === UserStatus.SUSPENDED) {
      await this.repository.revokeFamily(record.familyId, now);
      throw new AppError(AUTH_ERRORS.ACCOUNT_SUSPENDED);
    }
    return this.issue(user, record.familyId, now);
  }

  revokeAllForUser(userId: string, now = new Date()): Promise<void> {
    return this.repository.revokeAllForUser(userId, now);
  }

  async revoke(refreshToken: string, now = new Date()): Promise<void> {
    const record = await this.repository.findByHash(hashToken(refreshToken));
    if (record) await this.repository.revokeFamily(record.familyId, now);
  }
}
