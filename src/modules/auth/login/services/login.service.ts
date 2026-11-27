import { Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../generated/prisma/client.js';
import {
  hashPassword,
  verifyPassword,
} from '../../../../shared/crypto/password.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { toUserDto } from '../../../users/accounts/dto/user.dto.js';
import { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { LoginBody, RegisterBody } from '../dto/credentials.dto.js';
import type { SessionDto } from '../dto/session.dto.js';
import { TokensService } from './tokens.service.js';

let dummyHash: Promise<string> | undefined;

// Checking a password against a throwaway hash keeps unknown emails as slow as wrong passwords.
function slowDown(password: string) {
  dummyHash ??= hashPassword('not-a-real-account-password-1');
  return dummyHash.then((hash) => verifyPassword(hash, password));
}

function isDuplicateEmail(error: unknown) {
  return (error as { name?: string; code?: string })?.code === 'P2002';
}

@Injectable()
export class LoginService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly tokens: TokensService,
  ) {}

  async register({ email, password }: RegisterBody): Promise<SessionDto> {
    if (await this.accounts.findByEmail(email))
      throw new AppError(AUTH_ERRORS.EMAIL_TAKEN);
    const passwordHash = await hashPassword(password);
    const user = await this.accounts
      .createStudent(email, passwordHash)
      .catch((error: unknown) => {
        throw isDuplicateEmail(error)
          ? new AppError(AUTH_ERRORS.EMAIL_TAKEN, { cause: error })
          : error;
      });
    return { user: toUserDto(user), ...(await this.tokens.issue(user)) };
  }

  async login({ email, password }: LoginBody): Promise<SessionDto> {
    const user = await this.accounts.findByEmail(email);
    if (!user) {
      await slowDown(password);
      throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    if (!(await verifyPassword(user.passwordHash, password))) {
      throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    if (user.status === UserStatus.SUSPENDED)
      throw new AppError(AUTH_ERRORS.ACCOUNT_SUSPENDED);
    return { user: toUserDto(user), ...(await this.tokens.issue(user)) };
  }
}
