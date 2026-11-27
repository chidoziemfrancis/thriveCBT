import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/storage', () => ({
  readJson: (_key: string, fallback: unknown) => fallback,
  writeJson: () => undefined,
}));
const mockQueue = jest.fn<(change: unknown) => void>();
jest.mock('@/lib/sync', () => ({
  ...jest.requireActual<object>('@/lib/sync/items'),
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
}));

import {
  applyServerSessions,
  clearLocalSessions,
  completeModule,
  completeSession,
  saveAnswer,
  uploadLocalSessions,
  useSessionProgress,
} from '@/features/sessions/store/progressStore';

// The store is read through its hook; outside React, the snapshot getter is enough.
let snapshot: ReturnType<typeof useSessionProgress> = {};
jest.mock('react', () => ({
  useSyncExternalStore: (_subscribe: unknown, get: () => unknown) => get(),
}));
const progress = () => (snapshot = useSessionProgress());

const server = (sessionId: number, updatedAt: string, done: string[] = ['intro']) => ({
  sessionId,
  done,
  answers: {},
  completedAt: null,
  updatedAt,
});

beforeEach(() => {
  clearLocalSessions();
  mockQueue.mockReset();
});

describe('session progress sync', () => {
  it('saves on the phone and queues the whole record for the server', () => {
    completeModule(1, 'intro');
    saveAnswer(1, 'q1', 2);
    expect(progress()[1]).toMatchObject({ done: ['intro'], answers: { q1: 2 } });
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'sessions:1',
        kind: 'sessions',
        method: 'PUT',
        path: '/me/sessions/1',
        body: expect.objectContaining({
          done: ['intro'],
          answers: { q1: 2 },
          completedAt: null,
          updatedAt: snapshot[1].updatedAt,
        }),
      })
    );
  });

  it('sends nothing when nothing changed', () => {
    completeSession(2, new Date('2026-11-27T10:00:00Z'));
    completeSession(2, new Date('2026-11-28T10:00:00Z'));
    expect(mockQueue).toHaveBeenCalledTimes(1);
    expect(progress()[2].completedAt).toBe('2026-11-27T10:00:00.000Z');
  });

  it('takes the server’s record only when it is newer', () => {
    completeModule(1, 'intro');
    completeModule(1, 'story');
    applyServerSessions([
      server(1, '2000-01-01T00:00:00.000Z'),
      server(3, '2026-11-27T10:00:00.000Z'),
    ]);
    expect(progress()[1].done).toEqual(['intro', 'story']);
    expect(progress()[3]).toEqual({
      done: ['intro'],
      answers: {},
      updatedAt: '2026-11-27T10:00:00.000Z',
    });
    applyServerSessions([server(1, '2999-01-01T00:00:00.000Z', ['other'])]);
    expect(progress()[1].done).toEqual(['other']);
  });

  it('uploads progress from before sync only when the server lacks it', () => {
    applyServerSessions([server(4, '2026-11-27T10:00:00.000Z')]);
    completeModule(5, 'intro');
    mockQueue.mockReset();
    uploadLocalSessions([server(4, '2026-11-27T10:00:00.000Z')]);
    expect(mockQueue.mock.calls.map((c) => (c[0] as { key: string }).key)).toEqual(['sessions:5']);
  });
});
