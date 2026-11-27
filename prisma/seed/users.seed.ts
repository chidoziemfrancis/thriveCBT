import argon2 from 'argon2';

import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { UserRole } from '../../src/generated/prisma/enums.js';

export const SEED_PASSWORD = 'Password123';

const USERS = [
  { email: 'lead@thrivecbt.test', role: UserRole.LEAD },
  { email: 'grace.researcher@thrivecbt.test', role: UserRole.RESEARCHER },
  { email: 'tunde.researcher@thrivecbt.test', role: UserRole.RESEARCHER },
  { email: 'ada.student@thrivecbt.test', role: UserRole.STUDENT },
  { email: 'tolu.student@thrivecbt.test', role: UserRole.STUDENT },
];

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await argon2.hash(SEED_PASSWORD, {
    type: argon2.argon2id,
  });
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        passwordHash,
        ...(user.role === UserRole.STUDENT
          ? { studentProfile: { create: {} } }
          : {}),
      },
    });
  }
  return USERS.length;
}
