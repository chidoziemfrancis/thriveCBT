import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));
const mockQueue = jest.fn<(change: unknown) => void>();
jest.mock('@/lib/sync', () => ({
  ...jest.requireActual<object>('@/lib/sync/items'),
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
  onStudentChange: () => undefined,
}));

type Store = typeof import('@/features/homework/store/homeworkStore');
function loadStore(): Store {
  let store!: Store;
  jest.isolateModules(() => {
    store = require('@/features/homework/store/homeworkStore');
  });
  return store;
}

const DAY = '2026-11-28';

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
});

describe('homework tick sync', () => {
  it('sends a tick with an id from the session and day, and a delete when unticked', () => {
    const store = loadStore();
    const id = store.homeworkTickId(3, DAY);
    expect(id).toBe(loadStore().homeworkTickId(3, DAY));
    expect(id).not.toBe(store.homeworkTickId(4, DAY));
    store.toggleTick(3, DAY);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: `homework-ticks:${id}`,
        method: 'PUT',
        path: `/me/homework-ticks/${id}`,
        body: { sessionId: 3, date: DAY, updatedAt: expect.any(String) },
      })
    );
    store.toggleTick(3, DAY);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: `homework-ticks:${id}`, method: 'DELETE' })
    );
    expect(store.getHomeworkTicks()[3]).toEqual([]);
  });

  it('takes ticks from another phone, but never undoes a newer untick made here', () => {
    const store = loadStore();
    const id = store.homeworkTickId(3, DAY);
    store.toggleTick(3, DAY);
    store.toggleTick(3, DAY);
    const old = {
      id,
      sessionId: 3,
      date: DAY,
      updatedAt: '2000-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    store.applyServerHomeworkTicks([old]);
    expect(store.getHomeworkTicks()[3]).toEqual([]);
    const other = {
      ...old,
      id: store.homeworkTickId(5, DAY),
      sessionId: 5,
      updatedAt: '2999-01-01T00:00:00.000Z',
    };
    store.applyServerHomeworkTicks([other]);
    expect(store.getHomeworkTicks()[5]).toEqual([DAY]);
  });

  it('uploads ticks made before sync, unless the server has them', () => {
    mockMemory.set('homework_ticks', { 3: [DAY, '2026-11-29'] });
    const store = loadStore();
    store.uploadLocalHomeworkTicks([
      {
        id: store.homeworkTickId(3, DAY),
        sessionId: 3,
        date: DAY,
        updatedAt: '2026-11-28T00:00:00.000Z',
        deletedAt: null,
      },
    ]);
    expect(mockQueue.mock.calls.map((c) => (c[0] as { body: { date: string } }).body.date)).toEqual(
      ['2026-11-29']
    );
  });
});
