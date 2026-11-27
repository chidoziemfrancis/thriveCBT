import type { EmailCode } from '../../../../generated/prisma/client.js';
import type { EmailCodesRepository } from '../repositories/email-codes.repository.js';
import {
  CODE_MINUTES,
  EmailCodesService,
  MAX_ATTEMPTS,
} from '../services/email-codes.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');

function setup() {
  const rows: EmailCode[] = [];
  const repository = {
    replace: vi.fn(
      async (
        data: Pick<EmailCode, 'userId' | 'purpose' | 'codeHash' | 'expiresAt'>,
        now: Date,
      ) => {
        rows
          .filter(
            (r) =>
              r.userId === data.userId &&
              r.purpose === data.purpose &&
              !r.usedAt,
          )
          .forEach((r) => (r.usedAt = now));
        rows.push({
          ...data,
          id: `c${rows.length}`,
          attempts: 0,
          usedAt: null,
          createdAt: now,
        } as EmailCode);
      },
    ),
    findActive: vi.fn(
      async (userId: string, purpose: string) =>
        [...rows]
          .reverse()
          .find(
            (r) => r.userId === userId && r.purpose === purpose && !r.usedAt,
          ) ?? null,
    ),
    addAttempt: vi.fn(async (id: string) => {
      const row = rows.find((r) => r.id === id)!;
      row.attempts += 1;
      return row.attempts;
    }),
    markUsed: vi.fn(async (id: string, now: Date) => {
      const row = rows.find((r) => r.id === id && !r.usedAt);
      if (row) row.usedAt = now;
      return Boolean(row);
    }),
  };
  return {
    service: new EmailCodesService(
      repository as unknown as EmailCodesRepository,
    ),
    rows,
  };
}

describe('EmailCodesService', () => {
  it('issues a 6-digit code that expires in 15 minutes and is stored only as a hash', async () => {
    const { service, rows } = setup();
    const code = await service.issue('u1', 'VERIFY_EMAIL', NOW);
    expect(code).toMatch(/^\d{6}$/);
    expect(rows[0].codeHash).not.toContain(code);
    expect(rows[0].expiresAt.getTime() - NOW.getTime()).toBe(
      CODE_MINUTES * 60_000,
    );
  });

  it('accepts the right code once', async () => {
    const { service } = setup();
    const code = await service.issue('u1', 'VERIFY_EMAIL', NOW);
    await expect(
      service.consume('u1', 'VERIFY_EMAIL', code, NOW),
    ).resolves.toBeUndefined();
    await expect(
      service.consume('u1', 'VERIFY_EMAIL', code, NOW),
    ).rejects.toMatchObject({ code: 'AUTH_CODE_INVALID' });
  });

  it('retires the old code when a new one is issued', async () => {
    const { service } = setup();
    const first = await service.issue('u1', 'RESET_PASSWORD', NOW);
    const second = await service.issue('u1', 'RESET_PASSWORD', NOW);
    if (first !== second) {
      await expect(
        service.consume('u1', 'RESET_PASSWORD', first, NOW),
      ).rejects.toMatchObject({ code: 'AUTH_CODE_INVALID' });
    }
    await expect(
      service.consume('u1', 'RESET_PASSWORD', second, NOW),
    ).resolves.toBeUndefined();
  });

  it('keeps verify and reset codes apart', async () => {
    const { service } = setup();
    const code = await service.issue('u1', 'VERIFY_EMAIL', NOW);
    await expect(
      service.consume('u1', 'RESET_PASSWORD', code, NOW),
    ).rejects.toMatchObject({ code: 'AUTH_CODE_INVALID' });
  });

  it('rejects an expired code', async () => {
    const { service } = setup();
    const code = await service.issue('u1', 'VERIFY_EMAIL', NOW);
    const later = new Date(NOW.getTime() + (CODE_MINUTES + 1) * 60_000);
    await expect(
      service.consume('u1', 'VERIFY_EMAIL', code, later),
    ).rejects.toMatchObject({ code: 'AUTH_CODE_EXPIRED' });
  });

  it('locks the code after 5 wrong tries, even if the right one comes next', async () => {
    const { service } = setup();
    const code = await service.issue('u1', 'VERIFY_EMAIL', NOW);
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      await expect(
        service.consume('u1', 'VERIFY_EMAIL', wrong, NOW),
      ).rejects.toMatchObject({ code: 'AUTH_CODE_INVALID' });
    }
    await expect(
      service.consume('u1', 'VERIFY_EMAIL', wrong, NOW),
    ).rejects.toMatchObject({ code: 'AUTH_CODE_TOO_MANY_TRIES' });
    await expect(
      service.consume('u1', 'VERIFY_EMAIL', code, NOW),
    ).rejects.toMatchObject({ code: 'AUTH_CODE_TOO_MANY_TRIES' });
  });
});
