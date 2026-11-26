import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { UserRole } from '../../src/generated/prisma/enums.js';

const USERS = [
  { email: 'lead@thrivecbt.test', role: UserRole.LEAD },
  { email: 'grace.researcher@thrivecbt.test', role: UserRole.RESEARCHER },
  { email: 'tunde.researcher@thrivecbt.test', role: UserRole.RESEARCHER },
  { email: 'ada.student@thrivecbt.test', role: UserRole.STUDENT },
  { email: 'tolu.student@thrivecbt.test', role: UserRole.STUDENT },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  return USERS.length;
}
