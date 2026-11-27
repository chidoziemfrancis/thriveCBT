import { randomInt } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { User } from '../../../../generated/prisma/client.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import { AccountsRepository } from '../repositories/accounts.repository.js';

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Matches the app's codes, e.g. GRACE1: up to five letters of the first name and a digit.
export function inviteCodeCandidates(name: string): string[] {
  const letters = (name.trim().split(/\s+/)[0] ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 5);
  if (letters.length < 3) return [];
  return Array.from({ length: 9 }, (_, i) => `${letters}${i + 1}`);
}

function randomCode() {
  return Array.from(
    { length: 6 },
    () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
  ).join('');
}

@Injectable()
export class AccountsService {
  constructor(private readonly repository: AccountsRepository) {}

  leadEmails(): Promise<string[]> {
    return this.repository.leadEmails();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(normaliseEmail(email));
  }

  async getById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError(COMMON_ERRORS.NOT_FOUND);
    return user;
  }

  async markEmailVerified(user: User, now = new Date()): Promise<User> {
    if (user.emailVerifiedAt) return user;
    return this.repository.markEmailVerified(user.id, now);
  }

  // Resetting with an emailed code also proves the student owns the address.
  setPassword(
    userId: string,
    passwordHash: string,
    now = new Date(),
  ): Promise<User> {
    return this.repository.setPassword(userId, passwordHash, now);
  }

  async createResearcher(
    data: { email: string; passwordHash: string; name: string },
    now = new Date(),
  ) {
    return this.repository.createResearcher({
      email: normaliseEmail(data.email),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      inviteCode: await this.freeInviteCode(data.name),
      verifiedAt: now,
    });
  }

  createLead(
    email: string,
    passwordHash: string,
    now = new Date(),
  ): Promise<User> {
    return this.repository.createLead(normaliseEmail(email), passwordHash, now);
  }

  private async freeInviteCode(name: string): Promise<string> {
    for (const code of inviteCodeCandidates(name)) {
      if (!(await this.repository.inviteCodeTaken(code))) return code;
    }
    for (;;) {
      const code = randomCode();
      if (!(await this.repository.inviteCodeTaken(code))) return code;
    }
  }

  createStudent(email: string, passwordHash: string): Promise<User> {
    return this.repository.createStudent(normaliseEmail(email), passwordHash);
  }
}
