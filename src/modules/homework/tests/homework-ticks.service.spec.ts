import type { HomeworkTick } from '../../../generated/prisma/client.js';
import { saveHomeworkTickSchema } from '../dto/homework-tick.dto.js';
import type { HomeworkTicksRepository } from '../repositories/homework-ticks.repository.js';
import { HomeworkTicksService } from '../services/homework-ticks.service.js';

const ID = '01a21c8f-b277-82a8-bfc1-b9599ad4a318';
const T1 = '2026-11-28T10:00:00.000Z';
const T2 = '2026-11-28T11:00:00.000Z';
const T3 = '2026-11-28T12:00:00.000Z';

function setup() {
  const rows = new Map<string, HomeworkTick>();
  const key = (s: string, id: string) => `${s}:${id}`;
  const repository = {
    find: vi.fn(async (s: string, id: string) => rows.get(key(s, id)) ?? null),
    changedSince: vi.fn(async (s: string) =>
      [...rows.values()].filter((r) => r.studentId === s),
    ),
    save: vi.fn(
      async (
        s: string,
        id: string,
        data: { sessionId: number; date: string; updatedAt: Date },
      ) => {
        const row = {
          studentId: s,
          id,
          ...data,
          deletedAt: null,
          syncedAt: new Date(),
        } as HomeworkTick;
        rows.set(key(s, id), row);
        return row;
      },
    ),
    markDeleted: vi.fn(async (s: string, id: string, now: Date) => {
      const row = { ...rows.get(key(s, id))!, deletedAt: now, updatedAt: now };
      rows.set(key(s, id), row);
      return row;
    }),
  };
  return {
    service: new HomeworkTicksService(
      repository as unknown as HomeworkTicksRepository,
    ),
  };
}

const tick = { sessionId: 3, date: '2026-11-28', updatedAt: T1 };

describe('HomeworkTicksService', () => {
  it('ticks a day, unticks it, and ticks it again', async () => {
    const { service } = setup();
    await expect(service.save('s1', ID, tick)).resolves.toMatchObject({
      id: ID,
      sessionId: 3,
      date: '2026-11-28',
      deletedAt: null,
    });
    await service.remove('s1', ID, new Date(T2));
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ deletedAt: T2 }],
    });
    await expect(
      service.save('s1', ID, { ...tick, updatedAt: T3 }),
    ).resolves.toMatchObject({
      deletedAt: null,
    });
  });

  it('lets two students tick the same session and day', async () => {
    const { service } = setup();
    await service.save('s1', ID, tick);
    await expect(service.save('s2', ID, tick)).resolves.toMatchObject({
      id: ID,
    });
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{}],
    });
  });

  it('refuses an older untick-then-tick from another phone', async () => {
    const { service } = setup();
    await service.save('s1', ID, tick);
    await service.remove('s1', ID, new Date(T2));
    await expect(service.save('s1', ID, tick)).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
    });
  });

  it('needs a real date and a session from 1 to 8', () => {
    expect(
      saveHomeworkTickSchema.safeParse({ ...tick, sessionId: 9 }).success,
    ).toBe(false);
    expect(
      saveHomeworkTickSchema.safeParse({ ...tick, date: '28/11/2026' }).success,
    ).toBe(false);
  });
});
