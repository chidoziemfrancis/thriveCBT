import { existsSync } from 'node:fs';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/generated/prisma/client.js';
import { SEED_PASSWORD, seedUsers } from './users.seed.js';

if (existsSync('.env')) process.loadEnvFile('.env');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  const users = await seedUsers(prisma);
  console.log(`Seeded ${users} users (password: ${SEED_PASSWORD})`);
} finally {
  await prisma.$disconnect();
}
