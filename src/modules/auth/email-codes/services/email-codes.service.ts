import { randomInt } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { EmailCodePurpose } from '../../../../generated/prisma/client.js';
import { hashToken } from '../../../../shared/crypto/token-hash.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { EmailCodesRepository } from '../repositories/email-codes.repository.js';

export const CODE_LENGTH = 6;
export const CODE_MINUTES = 15;
export const MAX_ATTEMPTS = 5;

function hashCode(userId: string, code: string) {
  return hashToken(`${userId}:${code}`);
}

@Injectable()
export class EmailCodesService {
  constructor(private readonly repository: EmailCodesRepository) {}

  async issue(
    userId: string,
    purpose: EmailCodePurpose,
    now = new Date(),
  ): Promise<string> {
    const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(
      CODE_LENGTH,
      '0',
    );
    await this.repository.replace(
      {
        userId,
        purpose,
        codeHash: hashCode(userId, code),
        expiresAt: new Date(now.getTime() + CODE_MINUTES * 60_000),
      },
      now,
    );
    return code;
  }

  async consume(
    userId: string,
    purpose: EmailCodePurpose,
    code: string,
    now = new Date(),
  ): Promise<void> {
    const record = await this.repository.findActive(userId, purpose);
    if (!record) throw new AppError(AUTH_ERRORS.CODE_INVALID);
    if (record.expiresAt <= now) throw new AppError(AUTH_ERRORS.CODE_EXPIRED);
    if (record.attempts >= MAX_ATTEMPTS)
      throw new AppError(AUTH_ERRORS.CODE_TOO_MANY_TRIES);

    if (record.codeHash !== hashCode(userId, code)) {
      const attempts = await this.repository.addAttempt(record.id);
      throw new AppError(
        attempts >= MAX_ATTEMPTS
          ? AUTH_ERRORS.CODE_TOO_MANY_TRIES
          : AUTH_ERRORS.CODE_INVALID,
      );
    }
    if (!(await this.repository.markUsed(record.id, now)))
      throw new AppError(AUTH_ERRORS.CODE_INVALID);
  }
}
