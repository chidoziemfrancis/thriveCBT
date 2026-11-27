import type { ConfigService } from '../../../../config/config.service.js';
import type { Invite, User } from '../../../../generated/prisma/client.js';
import type { EmailService } from '../../../../integrations/email/email.service.js';
import { hashToken } from '../../../../shared/crypto/token-hash.js';
import type { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { TokensService } from '../../login/services/tokens.service.js';
import type { InvitesRepository } from '../repositories/invites.repository.js';
import { INVITE_DAYS, InvitesService } from '../services/invites.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');

function setup(existingEmails: string[] = []) {
  const invites: Invite[] = [];
  const repository = {
    replace: vi.fn(
      async (
        data: Omit<
          Invite,
          'id' | 'acceptedAt' | 'revokedAt' | 'createdAt' | 'updatedAt'
        >,
        now: Date,
      ) => {
        invites
          .filter(
            (i) => i.email === data.email && !i.acceptedAt && !i.revokedAt,
          )
          .forEach((i) => (i.revokedAt = now));
        const invite = {
          ...data,
          id: `00000000-0000-7000-8000-00000000000${invites.length}`,
          acceptedAt: null,
          revokedAt: null,
        } as Invite;
        invites.push(invite);
        return invite;
      },
    ),
    findByHash: vi.fn(
      async (hash: string) => invites.find((i) => i.tokenHash === hash) ?? null,
    ),
    markAccepted: vi.fn(async (id: string, now: Date) => {
      const invite = invites.find(
        (i) => i.id === id && !i.acceptedAt && !i.revokedAt,
      );
      if (invite) invite.acceptedAt = now;
      return Boolean(invite);
    }),
  };
  const accounts = {
    findByEmail: vi.fn(async (email: string) =>
      existingEmails.includes(email) ? ({ id: 'x' } as User) : null,
    ),
    createResearcher: vi.fn(async (data: { email: string; name: string }) => ({
      id: 'r1',
      email: data.email,
      role: 'RESEARCHER',
      status: 'ACTIVE',
      emailVerifiedAt: NOW,
      createdAt: NOW,
    })),
  };
  const tokens = {
    issue: vi.fn(async () => ({
      accessToken: 'access',
      refreshToken: 'refresh',
    })),
  };
  const email = {
    send: vi.fn(async (_message: { to: string; text: string }) => undefined),
  };
  const config = { get: () => 'thrivecbt://' };
  const service = new InvitesService(
    repository as unknown as InvitesRepository,
    accounts as unknown as AccountsService,
    tokens as unknown as TokensService,
    email as unknown as EmailService,
    config as unknown as ConfigService,
  );
  const tokenFromEmail = () =>
    /token=([A-Za-z0-9_-]+)/.exec(
      email.send.mock.calls.at(-1)?.[0].text ?? '',
    )?.[1] ?? '';
  return { service, invites, accounts, email, tokenFromEmail };
}

describe('InvitesService.create', () => {
  it('emails a link that opens the app, valid for 7 days, and stores only a hash', async () => {
    const { service, invites, email, tokenFromEmail } = setup();
    const dto = await service.create(
      'lead-1',
      { email: ' Grace@Uni.edu ', name: 'Grace Bello' },
      NOW,
    );

    expect(dto).toMatchObject({ email: 'grace@uni.edu', name: 'Grace Bello' });
    expect(email.send.mock.calls[0][0].text).toContain(
      'thrivecbt://researcher/accept-invite?token=',
    );
    expect(invites[0].tokenHash).toBe(hashToken(tokenFromEmail()));
    expect(invites[0].expiresAt.getTime() - NOW.getTime()).toBe(
      INVITE_DAYS * 86_400_000,
    );
    expect(invites[0].invitedById).toBe('lead-1');
  });

  it('refuses an email that already has an account', async () => {
    const { service } = setup(['grace@uni.edu']);
    await expect(
      service.create('lead-1', { email: 'grace@uni.edu', name: 'Grace' }, NOW),
    ).rejects.toMatchObject({
      code: 'AUTH_INVITE_EMAIL_TAKEN',
    });
  });

  it('retires an earlier invite to the same email', async () => {
    const { service, tokenFromEmail } = setup();
    await service.create(
      'lead-1',
      { email: 'grace@uni.edu', name: 'Grace' },
      NOW,
    );
    const first = tokenFromEmail();
    await service.create(
      'lead-1',
      { email: 'grace@uni.edu', name: 'Grace' },
      NOW,
    );
    await expect(
      service.accept({ token: first, password: 'Password123' }, NOW),
    ).rejects.toMatchObject({
      code: 'AUTH_INVITE_INVALID',
    });
  });
});

describe('InvitesService.accept', () => {
  it('creates a confirmed researcher account and logs them in, once', async () => {
    const { service, accounts, tokenFromEmail } = setup();
    await service.create(
      'lead-1',
      { email: 'grace@uni.edu', name: 'Grace Bello' },
      NOW,
    );
    const token = tokenFromEmail();

    await expect(
      service.accept({ token, password: 'Password123' }, NOW),
    ).resolves.toMatchObject({
      user: { role: 'researcher', emailVerified: true },
      accessToken: 'access',
    });
    expect(accounts.createResearcher).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'grace@uni.edu',
        name: 'Grace Bello',
        passwordHash: expect.stringMatching(/^\$argon2id\$/),
      }),
      NOW,
    );
    await expect(
      service.accept({ token, password: 'Password123' }, NOW),
    ).rejects.toMatchObject({
      code: 'AUTH_INVITE_INVALID',
    });
  });

  it('rejects unknown and expired invites', async () => {
    const { service, tokenFromEmail } = setup();
    await expect(
      service.accept({ token: 'x'.repeat(43), password: 'Password123' }, NOW),
    ).rejects.toMatchObject({
      code: 'AUTH_INVITE_INVALID',
    });
    await service.create(
      'lead-1',
      { email: 'grace@uni.edu', name: 'Grace' },
      NOW,
    );
    const later = new Date(NOW.getTime() + (INVITE_DAYS + 1) * 86_400_000);
    await expect(
      service.accept(
        { token: tokenFromEmail(), password: 'Password123' },
        later,
      ),
    ).rejects.toMatchObject({
      code: 'AUTH_INVITE_EXPIRED',
    });
  });
});
