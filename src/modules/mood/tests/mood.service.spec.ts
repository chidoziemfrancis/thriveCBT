import type { MoodEntry } from '../../../generated/prisma/client.js';
import { saveMoodSchema } from '../dto/mood.dto.js';
import type { MoodRepository } from '../repositories/mood.repository.js';
import { MoodService } from '../services/mood.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-27T10:00:00.000Z';
const T2 = '2026-11-27T10:05:00.000Z';

function setup() {
  const rows = new Map<string, MoodEntry>();
  const repository = {
    find: vi.fn(async (id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async (studentId: string) =>
      [...rows.values()].filter((r) => r.studentId === studentId),
    ),
    save: vi.fn(
      async (
        id: string,
        studentId: string,
        data: Pick<MoodEntry, 'mood' | 'note' | 'at' | 'updatedAt'>,
      ) => {
        const row = {
          id,
          studentId,
          deletedAt: null,
          ...rows.get(id),
          ...data,
          syncedAt: new Date(),
        } as MoodEntry;
        rows.set(id, row);
        return row;
      },
    ),
    markDeleted: vi.fn(async (id: string, now: Date) => {
      const row = {
        ...rows.get(id)!,
        deletedAt: now,
        updatedAt: now,
        note: null,
      };
      rows.set(id, row);
      return row;
    }),
  };
  return {
    service: new MoodService(repository as unknown as MoodRepository),
    repository,
  };
}

const body = (
  over: Partial<{ mood: number; note: string | null; updatedAt: string }> = {},
) => ({
  mood: 3,
  note: 'Good day',
  at: T1,
  updatedAt: T1,
  ...over,
});

describe('MoodService', () => {
  it('creates a mood with the phone’s id, then updates it', async () => {
    const { service } = setup();
    await expect(service.save('s1', ID, body())).resolves.toEqual({
      id: ID,
      mood: 3,
      note: 'Good day',
      at: T1,
      updatedAt: T1,
      deletedAt: null,
    });
    await expect(
      service.save('s1', ID, body({ note: '', updatedAt: T2 })),
    ).resolves.toMatchObject({ note: null, updatedAt: T2 });
  });

  it('refuses an older change, and hides another student’s mood', async () => {
    const { service } = setup();
    await service.save('s1', ID, body({ updatedAt: T2 }));
    await expect(service.save('s1', ID, body())).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
    });
    await expect(
      service.save('s2', ID, body({ updatedAt: T2 })),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.remove('s2', ID)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('deletes with a marker, clears the note, and keeps it deleted', async () => {
    const { service } = setup();
    await service.save('s1', ID, body());
    const now = new Date('2026-11-27T11:00:00Z');
    await service.remove('s1', ID, now);
    const { items } = await service.list('s1', {});
    expect(items[0]).toMatchObject({
      deletedAt: now.toISOString(),
      note: null,
    });
    await expect(
      service.save('s1', ID, body({ updatedAt: '2030-01-01T00:00:00.000Z' })),
    ).rejects.toMatchObject({ code: 'SYNC_STALE_UPDATE' });
  });

  it('is fine deleting something it never saw, or twice', async () => {
    const { service, repository } = setup();
    await service.remove('s1', ID);
    await service.save('s1', ID, body());
    await service.remove('s1', ID);
    await service.remove('s1', ID);
    expect(repository.markDeleted).toHaveBeenCalledTimes(1);
  });
});

describe('mood checks', () => {
  it('take a mood from 0 to 4 and a short note', () => {
    expect(saveMoodSchema.safeParse(body({ mood: 4 })).success).toBe(true);
    expect(saveMoodSchema.safeParse(body({ mood: 5 })).success).toBe(false);
    expect(
      saveMoodSchema.safeParse(body({ note: 'x'.repeat(501) })).success,
    ).toBe(false);
  });
});
