import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPost = jest.fn<(...args: unknown[]) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({ api: { post: (...args: unknown[]) => mockPost(...args) } }));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));

import { authService } from '@/features/auth/api/auth.service';
import { homeFor } from '@/features/auth/roles';
import { passwordSchema, codeSchema } from '@/features/auth/schemas/auth.schema';
import { isTestAccount } from '@/features/auth/testAccounts';

beforeEach(() => {
  mockPost.mockReset().mockResolvedValue({ data: { ok: true } });
});

describe('authService', () => {
  it('calls the open auth routes without triggering a token refresh', async () => {
    await authService.checkEmail('ada@uni.edu');
    await authService.login({ email: 'ada@uni.edu', password: 'Password123' });
    await authService.requestReset('ada@uni.edu');
    expect(mockPost.mock.calls.map((call) => [call[0], call[2]])).toEqual([
      ['/auth/check-email', { skipAuthRefresh: true }],
      ['/auth/login', { skipAuthRefresh: true }],
      ['/auth/password-reset/request', { skipAuthRefresh: true }],
    ]);
  });

  it('verifies the email as the logged-in user', async () => {
    await authService.verifyEmail('123456');
    expect(mockPost).toHaveBeenCalledWith('/auth/verify-email', { code: '123456' });
  });
});

describe('auth rules', () => {
  it('match the backend: 8+ characters with a letter and a number, and 6-digit codes', () => {
    expect(passwordSchema.safeParse('Password1').success).toBe(true);
    for (const weak of ['short1', 'allletters', '12345678']) {
      expect(passwordSchema.safeParse(weak).success).toBe(false);
    }
    expect(codeSchema.safeParse('012345').success).toBe(true);
    expect(codeSchema.safeParse('12345').success).toBe(false);
  });

  it('treats the seeded @thrivecbt.test accounts as test accounts', () => {
    expect(isTestAccount('Ada.Student@thrivecbt.test')).toBe(true);
    expect(isTestAccount('ada@uni.edu')).toBe(false);
    expect(isTestAccount(undefined)).toBe(false);
  });

  it('sends each role to its home', () => {
    expect(homeFor('student')).toBe('/dashboard');
    expect(homeFor('researcher')).toBe('/researcher');
  });
});
