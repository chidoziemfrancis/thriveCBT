import argon2 from 'argon2';

import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { UserRole } from '../../src/generated/prisma/enums.js';

export const SEED_PASSWORD = 'Password123';

const RESEARCHER_PROFILES: Record<
  string,
  { name: string; title: string; inviteCode: string }
> = {
  'grace.researcher@thrivecbt.test': {
    name: 'Grace Bello',
    title: 'Clinical psychology PhD student',
    inviteCode: 'GRACE1',
  },
  'tunde.researcher@thrivecbt.test': {
    name: 'Tunde Adeyemi',
    title: 'Counselling psychologist',
    inviteCode: 'TUNDE1',
  },
};

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
        emailVerifiedAt: new Date(),
        ...(user.role === UserRole.STUDENT
          ? { studentProfile: { create: {} } }
          : {}),
      },
    });
  }
  // Test accounts are ready to sign in to, so testers don't wait for a code they never asked for.
  await prisma.user.updateMany({
    where: { email: { in: USERS.map((u) => u.email) }, emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });
  for (const [email, profile] of Object.entries(RESEARCHER_PROFILES)) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.researcherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, ...profile },
    });
  }
  return USERS.length;
}
