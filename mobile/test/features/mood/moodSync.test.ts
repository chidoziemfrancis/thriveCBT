import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));
let mockId = 0;
jest.mock('expo-crypto', () => ({ randomUUID: () => `id-${++mockId}` }));
const mockQueue = jest.fn<(change: unknown) => void>();
jest.mock('@/lib/sync', () => ({
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
}));

import {
  applyServerMoods,
  getMoodLog,
  logMood,
  setTodaysMoodNote,
  uploadLocalMoods,
} from '@/features/mood/store/moodStore';

const day = new Date(2026, 10, 27, 9);
const server = (id: string, updatedAt: string, over: Record<string, unknown> = {}) => ({
  id,
  mood: 2,
  note: null,
  at: new Date(2026, 10, 26, 9).toISOString(),
  updatedAt,
  deletedAt: null,
  ...over,
});

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
  mockId = 0;
});

describe('mood sync', () => {
  it('gives each mood an id and queues it for the server', () => {
    const entry = logMood(3, day);
    expect(entry.id).toBe('id-1');
    expect(mockQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'moods:id-1',
        method: 'PUT',
        path: '/me/moods/id-1',
        body: expect.objectContaining({ mood: 3, note: null, at: day.toISOString() }),
      })
    );
    setTodaysMoodNote('Tired', day);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'moods:id-1',
        body: expect.objectContaining({ note: 'Tired' }),
      })
    );
  });

  it('gives moods saved before sync an id, once', () => {
    mockMemory.set('mood_log', [{ mood: 1, at: day.toISOString() }]);
    const first = getMoodLog()[0].id;
    expect(first).toBeDefined();
    expect(getMoodLog()[0].id).toBe(first);
  });

  it('takes newer server moods, keeps newer local ones, and removes deleted ones', () => {
    const mine = logMood(3, day);
    applyServerMoods([
      server(mine.id, '2000-01-01T00:00:00.000Z', { mood: 0 }),
      server('elsewhere', '2026-11-27T10:00:00.000Z', { note: 'From the tablet' }),
    ]);
    expect(getMoodLog().map((e) => [e.id, e.mood, e.note])).toEqual([
      ['elsewhere', 2, 'From the tablet'],
      [mine.id, 3, undefined],
    ]);
    applyServerMoods([
      server('elsewhere', '2026-11-27T11:00:00.000Z', { deletedAt: '2026-11-27T11:00:00.000Z' }),
    ]);
    expect(getMoodLog().map((e) => e.id)).toEqual([mine.id]);
  });

  it('uploads only moods the server doesn’t have', () => {
    mockMemory.set('mood_log', [
      { id: 'a', mood: 1, at: day.toISOString() },
      { id: 'b', mood: 2, at: day.toISOString() },
    ]);
    uploadLocalMoods([server('a', '2026-11-27T10:00:00.000Z')]);
    expect(mockQueue.mock.calls.map((c) => (c[0] as { key: string }).key)).toEqual(['moods:b']);
  });
});
