import type { Consent } from '../../../generated/prisma/client.js';
import { giveConsentSchema } from '../dto/consent.dto.js';
import type { ConsentRepository } from '../repositories/consent.repository.js';
import { ConsentService } from '../services/consent.service.js';

function setup() {
  const rows: Consent[] = [];
  const repository = {
    latest: vi.fn(
      async (userId: string) =>
        rows
          .filter((r) => r.userId === userId)
          .sort((a, b) => +b.agreedAt - +a.agreedAt)[0] ?? null,
    ),
    record: vi.fn(async (userId: string, version: string, agreedAt: Date) => {
      const existing = rows.find(
        (r) => r.userId === userId && r.version === version,
      );
      if (existing) return existing;
      const row = { userId, version, agreedAt } as Consent;
      rows.push(row);
      return row;
    }),
  };
  return {
    service: new ConsentService(repository as unknown as ConsentRepository),
  };
}

describe('ConsentService', () => {
  it('records consent and returns the latest version', async () => {
    const { service } = setup();
    await service.give(
      'u1',
      'draft-2026-11-03',
      new Date('2026-11-27T10:00:00Z'),
    );
    await expect(service.get('u1')).resolves.toEqual({
      version: 'draft-2026-11-03',
      agreedAt: '2026-11-27T10:00:00.000Z',
    });
  });

  it('keeps the first date when the same version is agreed again', async () => {
    const { service } = setup();
    await service.give('u1', 'v1', new Date('2026-11-27T10:00:00Z'));
    await expect(
      service.give('u1', 'v1', new Date('2026-12-01T10:00:00Z')),
    ).resolves.toMatchObject({
      agreedAt: '2026-11-27T10:00:00.000Z',
    });
  });

  it('throws NOT_FOUND before any consent', async () => {
    await expect(setup().service.get('u1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('accepts the app’s version format and refuses anything else', () => {
    expect(
      giveConsentSchema.safeParse({ version: 'draft-2026-11-03' }).success,
    ).toBe(true);
    expect(giveConsentSchema.safeParse({ version: '' }).success).toBe(false);
    expect(
      giveConsentSchema.safeParse({ version: 'v1; drop table' }).success,
    ).toBe(false);
  });
});
