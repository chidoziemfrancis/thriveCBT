import { JwtService } from '@nestjs/jwt';

import type {
  RefreshToken,
  User,
} from '../../../../generated/prisma/client.js';
import { hashToken } from '../../../../shared/crypto/token-hash.js';
import type { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { RefreshTokensRepository } from '../repositories/refresh-tokens.repository.js';
import {
  REFRESH_TOKEN_DAYS,
  TokensService,
} from '../services/tokens.service.js';

const jwt = new JwtService({
  secret: 'test-secret-test-secret-test-secret',
  signOptions: { expiresIn: '15m' },
});
const student = { id: 'u1', role: 'STUDENT', status: 'ACTIVE' } as User;

function setup(user: Partial<User> = student) {
  const rows: RefreshToken[] = [];
  const repository = {
    create: vi.fn(
      async (
        data: Omit<
          RefreshToken,
          'id' | 'revokedAt' | 'createdAt' | 'updatedAt'
        >,
      ) => {
        const row = {
          ...data,
          id: `t${rows.length}`,
          revokedAt: null,
        } as RefreshToken;
        rows.push(row);
        return row;
      },
    ),
    findByHash: vi.fn(
      async (hash: string) => rows.find((r) => r.tokenHash === hash) ?? null,
    ),
    revokeIfActive: vi.fn(async (id: string, now: Date) => {
      const row = rows.find((r) => r.id === id && !r.revokedAt);
      if (row) row.revokedAt = now;
      return Boolean(row);
    }),
    revokeFamily: vi.fn(async (familyId: string, now: Date) => {
      rows
        .filter((r) => r.familyId === familyId && !r.revokedAt)
        .forEach((r) => (r.revokedAt = now));
    }),
  };
  const accounts = { getById: vi.fn(async () => user) };
  const service = new TokensService(
    jwt,
    repository as unknown as RefreshTokensRepository,
    accounts as unknown as AccountsService,
  );
  return { service, rows };
}

describe('TokensService', () => {
  it('issues an access token with the user id and role, and stores only a hash of the refresh token', async () => {
    const { service, rows } = setup();
    const now = new Date('2026-11-27T10:00:00Z');
    const pair = await service.issue(student, undefined, now);

    expect(await jwt.verifyAsync(pair.accessToken)).toMatchObject({
      sub: 'u1',
      role: 'student',
    });
    expect(rows[0].tokenHash).toBe(hashToken(pair.refreshToken));
    expect(JSON.stringify(rows)).not.toContain(pair.refreshToken);
    expect(rows[0].expiresAt.getTime() - now.getTime()).toBe(
      REFRESH_TOKEN_DAYS * 86_400_000,
    );
  });

  it('swaps a refresh token for a new pair in the same login, retiring the old one', async () => {
    const { service, rows } = setup();
    const first = await service.issue(student);
    const second = await service.rotate(first.refreshToken);

    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(rows[0].revokedAt).not.toBeNull();
    expect(rows[1]).toMatchObject({
      familyId: rows[0].familyId,
      revokedAt: null,
    });
  });

  it('treats reuse of a retired token as theft and ends the whole login', async () => {
    const { service, rows } = setup();
    const first = await service.issue(student);
    await service.rotate(first.refreshToken);

    await expect(service.rotate(first.refreshToken)).rejects.toMatchObject({
      code: 'AUTH_TOKEN_REUSED',
    });
    expect(rows.every((r) => r.revokedAt)).toBe(true);
  });

  it('rejects unknown and expired tokens', async () => {
    const { service } = setup();
    await expect(service.rotate('x'.repeat(43))).rejects.toMatchObject({
      code: 'AUTH_TOKEN_INVALID',
    });

    const old = await service.issue(
      student,
      undefined,
      new Date('2026-01-01T00:00:00Z'),
    );
    await expect(
      service.rotate(old.refreshToken, new Date('2026-03-01T00:00:00Z')),
    ).rejects.toMatchObject({
      code: 'AUTH_TOKEN_EXPIRED',
    });
  });

  it('refuses to refresh a suspended account and ends its login', async () => {
    const { service, rows } = setup({ ...student, status: 'SUSPENDED' });
    const pair = await service.issue(student);
    await expect(service.rotate(pair.refreshToken)).rejects.toMatchObject({
      code: 'AUTH_ACCOUNT_SUSPENDED',
    });
    expect(rows.every((r) => r.revokedAt)).toBe(true);
  });

  it('refuses to refresh after the student withdraws', async () => {
    const { service, rows } = setup({ ...student, status: 'WITHDRAWN' });
    const pair = await service.issue(student);
    await expect(service.rotate(pair.refreshToken)).rejects.toMatchObject({
      code: 'AUTH_ACCOUNT_WITHDRAWN',
    });
    expect(rows.every((r) => r.revokedAt)).toBe(true);
  });

  it('logs out by retiring the login, and ignores unknown tokens', async () => {
    const { service, rows } = setup();
    const pair = await service.issue(student);
    await service.revoke(pair.refreshToken);
    expect(rows[0].revokedAt).not.toBeNull();
    await expect(
      service.revoke('unknown-token-unknown-token'),
    ).resolves.toBeUndefined();
  });
});
