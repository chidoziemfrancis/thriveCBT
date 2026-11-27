import { Injectable } from '@nestjs/common';

import type { User } from '../../../../generated/prisma/client.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import { AccountsRepository } from '../repositories/accounts.repository.js';

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

@Injectable()
export class AccountsService {
  constructor(private readonly repository: AccountsRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(normaliseEmail(email));
  }

  async getById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError(COMMON_ERRORS.NOT_FOUND);
    return user;
  }

  createStudent(email: string, passwordHash: string): Promise<User> {
    return this.repository.createStudent(normaliseEmail(email), passwordHash);
  }
}
