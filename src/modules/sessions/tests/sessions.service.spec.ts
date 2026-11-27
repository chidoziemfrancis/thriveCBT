import type { SessionProgress } from '../../../generated/prisma/client.js';
import { saveSessionSchema, sessionIdSchema } from '../dto/session.dto.js';
import type { SessionsRepository } from '../repositories/sessions.repository.js';
import { SessionsService } from '../services/sessions.service.js';

const T1 = '2026-11-27T10:00:00.000Z';
const T2 = '2026-11-27T10:05:00.000Z';

function setup() {
  const rows = new Map<number, SessionProgress>();
  const repository = {
    find: vi.fn(
      async (_studentId: string, sessionId: number) =>
        rows.get(sessionId) ?? null,
    ),
    changedSince: vi.fn(async (_studentId: string, since?: Date) =>
      [...rows.values()].filter((r) => !since || r.syncedAt > since),
    ),
    save: vi.fn(
      async (
        studentId: string,
        sessionId: number,
        data: Pick<
          SessionProgress,
          'done' | 'answers' | 'completedAt' | 'updatedAt'
        >,
      ) => {
        const row = {
          id: `s${sessionId}`,
          studentId,
          sessionId,
          ...data,
          syncedAt: new Date(),
        };
        rows.set(sessionId, row as SessionProgress);
        return row as SessionProgress;
      },
    ),
  };
  const service = new SessionsService(
    repository as unknown as SessionsRepository,
  );
  return { service, repository };
}

describe('SessionsService', () => {
  it('saves the whole record and returns it', async () => {
    const { service } = setup();
    await expect(
      service.save('s1', 1, {
        done: ['intro', 'intro'],
        answers: { q1: 2 },
        updatedAt: T1,
      }),
    ).resolves.toEqual({
      sessionId: 1,
      done: ['intro'],
      answers: { q1: 2 },
      completedAt: null,
      updatedAt: T1,
    });
  });

  it('refuses an older change from another phone, sending back what is saved', async () => {
    const { service } = setup();
    await service.save('s1', 1, {
      done: ['intro', 'story'],
      answers: {},
      updatedAt: T2,
    });
    await expect(
      service.save('s1', 1, { done: ['intro'], answers: {}, updatedAt: T1 }),
    ).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
      details: { current: { done: ['intro', 'story'] } },
    });
  });

  it('treats the same change sent twice as one', async () => {
    const { service } = setup();
    const body = { done: ['intro'], answers: {}, updatedAt: T1 };
    await service.save('s1', 1, body);
    await expect(service.save('s1', 1, body)).resolves.toMatchObject({
      done: ['intro'],
    });
  });

  it('keeps a finished session finished', async () => {
    const { service } = setup();
    await service.save('s1', 8, {
      done: ['a'],
      answers: {},
      completedAt: T1,
      updatedAt: T1,
    });
    await expect(
      service.save('s1', 8, {
        done: ['a'],
        answers: {},
        completedAt: null,
        updatedAt: T2,
      }),
    ).resolves.toMatchObject({ completedAt: T1 });
    await expect(service.hasFinished('s1', 8)).resolves.toBe(true);
    await expect(service.hasFinished('s1', 7)).resolves.toBe(false);
  });

  it('lists everything, or only what changed since the last pull, with the server time', async () => {
    const { service } = setup();
    await service.save('s1', 1, { done: [], answers: {}, updatedAt: T1 });
    const now = new Date('2030-01-01T00:00:00Z');
    await expect(service.list('s1', {}, now)).resolves.toMatchObject({
      items: [{ sessionId: 1 }],
      serverTime: now.toISOString(),
    });
    await expect(
      service.list('s1', { since: now.toISOString() }),
    ).resolves.toMatchObject({
      items: [],
    });
  });
});

describe('session checks', () => {
  it('take every answer shape the app saves, and nothing else', () => {
    const body = (answers: unknown) =>
      saveSessionSchema.safeParse({ done: [], answers, updatedAt: T1 }).success;
    expect(body({ a: 1, b: [1, 2], c: ['x'], d: true, e: 'text' })).toBe(true);
    expect(body({ a: { nested: true } })).toBe(false);
    expect(body({ a: 'x'.repeat(5001) })).toBe(false);
  });

  it('only know sessions 1 to 8', () => {
    expect(sessionIdSchema.parse('8')).toBe(8);
    expect(sessionIdSchema.safeParse('9').success).toBe(false);
    expect(sessionIdSchema.safeParse('0').success).toBe(false);
  });
});
