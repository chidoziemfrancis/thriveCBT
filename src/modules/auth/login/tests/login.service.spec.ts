import type { User } from '../../../../generated/prisma/client.js';
import { hashPassword } from '../../../../shared/crypto/password.js';
import type { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import { loginSchema, registerSchema } from '../dto/credentials.dto.js';
import { LoginService } from '../services/login.service.js';
import type { TokensService } from '../services/tokens.service.js';

const tokens = {
  issue: vi.fn(async () => ({
    accessToken: 'access',
    refreshToken: 'refresh',
  })),
};

async function setup(existing?: Partial<User>) {
  const user = existing && {
    id: 'u1',
    email: 'ada@uni.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: new Date('2026-11-01T00:00:00Z'),
    passwordHash: await hashPassword('Password123'),
    ...existing,
  };
  const accounts = {
    findByEmail: vi.fn(async (email: string) =>
      user && email.toLowerCase() === user.email ? user : null,
    ),
    createStudent: vi.fn(async (email: string, passwordHash: string) => ({
      id: 'new',
      email,
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date('2026-11-27T00:00:00Z'),
    })),
  };
  const service = new LoginService(
    accounts as unknown as AccountsService,
    tokens as unknown as TokensService,
  );
  return { service, accounts };
}

describe('LoginService.register', () => {
  it('creates a student with a hashed password and logs them in', async () => {
    const { service, accounts } = await setup();
    const session = await service.register({
      email: 'new@uni.edu',
      password: 'Password123',
    });

    expect(session).toMatchObject({
      user: { id: 'new', role: 'student', status: 'active' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(accounts.createStudent.mock.calls[0][1]).toMatch(/^\$argon2id\$/);
    expect(session.user).not.toHaveProperty('passwordHash');
  });

  it('refuses an email that already has an account', async () => {
    const { service } = await setup({});
    await expect(
      service.register({ email: 'ada@uni.edu', password: 'Password123' }),
    ).rejects.toMatchObject({
      code: 'AUTH_EMAIL_TAKEN',
      status: 409,
    });
  });
});

describe('LoginService.login', () => {
  it('logs in with the right password', async () => {
    const { service } = await setup({});
    await expect(
      service.login({ email: 'Ada@Uni.edu', password: 'Password123' }),
    ).resolves.toMatchObject({
      user: { id: 'u1' },
    });
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const { service } = await setup({});
    await expect(
      service.login({ email: 'ada@uni.edu', password: 'wrong123' }),
    ).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    });
    await expect(
      service.login({ email: 'nobody@uni.edu', password: 'Password123' }),
    ).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    });
  });

  it('refuses a suspended account', async () => {
    const { service } = await setup({ status: 'SUSPENDED' });
    await expect(
      service.login({ email: 'ada@uni.edu', password: 'Password123' }),
    ).rejects.toMatchObject({
      code: 'AUTH_ACCOUNT_SUSPENDED',
    });
  });
});

describe('credential checks', () => {
  it('match the app: 8+ characters with a letter and a number', () => {
    expect(
      registerSchema.safeParse({ email: 'a@b.co', password: 'Password1' })
        .success,
    ).toBe(true);
    for (const password of ['short1', 'allletters', '12345678']) {
      expect(
        registerSchema.safeParse({ email: 'a@b.co', password }).success,
      ).toBe(false);
    }
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success,
    ).toBe(false);
  });
});
