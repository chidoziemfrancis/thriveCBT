import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));
let mockId = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: () => `00000000-0000-4000-8000-${String(++mockId).padStart(12, '0')}`,
}));
const mockQueue = jest.fn<(change: unknown) => void>();
jest.mock('@/lib/sync', () => ({
  ...jest.requireActual<object>('@/lib/sync/items'),
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
}));

function load<T>(path: string): T {
  let store!: T;
  jest.isolateModules(() => {
    store = require(path);
  });
  return store;
}
type Thoughts = typeof import('@/features/thoughts/store/thoughtLogStore');
type Positive = typeof import('@/features/beliefs/store/positiveLogStore');

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
  mockId = 0;
});

const record = {
  situation: 'Chat went quiet',
  thought: 'They hate me',
  feeling: ['anxious', 'Worried', '70'],
  traps: ['mind-reading'],
  sessionId: 3,
};

describe('thought log sync', () => {
  it('queues a new record with every field the server needs', () => {
    const store = load<Thoughts>('@/features/thoughts/store/thoughtLogStore');
    const created = store.addThoughtRecord(record);
    expect(mockQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        key: `thought-records:${created.id}`,
        method: 'PUT',
        path: `/me/thought-records/${created.id}`,
        body: expect.objectContaining({
          ...record,
          action: null,
          balanced: null,
          beliefBefore: null,
          beliefAfter: null,
        }),
      })
    );
  });

  it('gives old records a UUID and keeps the newest first after a pull', () => {
    mockMemory.set('thought_log', [{ ...record, id: 'thought-1', at: '2026-11-01T09:00:00.000Z' }]);
    const store = load<Thoughts>('@/features/thoughts/store/thoughtLogStore');
    expect(store.getThoughtLog()[0].id).toMatch(/^0{8}-/);
    store.applyServerThoughtRecords([
      {
        ...record,
        id: 'tablet',
        action: null,
        balanced: 'Maybe they’re busy',
        beliefBefore: 80,
        beliefAfter: 30,
        at: '2026-11-20T09:00:00.000Z',
        updatedAt: '2026-11-20T09:00:00.000Z',
        deletedAt: null,
      },
    ]);
    expect(store.getThoughtLog().map((r) => [r.id, r.balanced ?? null])).toEqual([
      ['tablet', 'Maybe they’re busy'],
      [store.getThoughtLog()[1].id, null],
    ]);
  });
});

describe('positive log sync', () => {
  it('queues new entries and deletes', () => {
    const store = load<Positive>('@/features/beliefs/store/positiveLogStore');
    store.addPositive([{ kind: 'win', text: 'Finished my essay' }]);
    const [entry] = store.getPositiveLog();
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: `positive-entries:${entry.id}`,
        method: 'PUT',
        body: expect.objectContaining({ kind: 'win', text: 'Finished my essay' }),
      })
    );
    store.removePositive(entry.id);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: `positive-entries:${entry.id}`, method: 'DELETE' })
    );
  });

  it('gives old entries a UUID and removes ones deleted on another phone', () => {
    mockMemory.set('positive_log', [
      { id: 'positive-1-0', kind: 'win', text: 'Old', at: '2026-11-01T09:00:00.000Z' },
    ]);
    const store = load<Positive>('@/features/beliefs/store/positiveLogStore');
    const [old] = store.getPositiveLog();
    expect(old.id).toMatch(/^0{8}-/);
    store.applyServerPositiveEntries([
      {
        id: old.id,
        kind: 'win',
        text: '',
        at: old.at,
        updatedAt: '2030-01-01T00:00:00.000Z',
        deletedAt: '2030-01-01T00:00:00.000Z',
      },
    ]);
    expect(store.getPositiveLog()).toEqual([]);
  });
});
