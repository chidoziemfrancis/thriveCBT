import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run lead:create -- <email>');
  process.exit(1);
}
if (existsSync('.env')) process.loadEnvFile('.env');

const { AppModule } = await import('../dist/app.module.js');
const { AccountsService } =
  await import('../dist/modules/users/accounts/services/accounts.service.js');
const { hashPassword } = await import('../dist/shared/crypto/password.js');

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: false,
});
try {
  const accounts = app.get(AccountsService);
  if (await accounts.findByEmail(email)) {
    console.error(`${email} already has an account.`);
    process.exitCode = 1;
  } else {
    const password = randomBytes(12).toString('base64url');
    await accounts.createLead(email, await hashPassword(password));
    console.log(`Study lead created: ${email}`);
    console.log(`Temporary password (shown once): ${password}`);
    console.log('Log in and change it with "Forgot password".');
  }
} finally {
  await app.close();
}
