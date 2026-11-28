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
  onStudentChange: () => undefined,
}));

type Store = typeof import('@/features/coping/store/copingStore');
function loadStore(): Store {
  let store!: Store;
  jest.isolateModules(() => {
    store = require('@/features/coping/store/copingStore');
  });
  return store;
}

const calls = () =>
  mockQueue.mock.calls.map((c) => c[0] as { key: string; method: string; body?: unknown });

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
  mockId = 0;
});

describe('toolkit sync', () => {
  it('sends a kept card with an id made from the card, and deletes it when removed', () => {
    const store = loadStore();
    store.saveTools(['box', 'walk']);
    const box = store.toolkitItemId('box');
    expect(box).toBe(loadStore().toolkitItemId('box'));
    expect(calls().map((c) => [c.key, c.method])).toEqual([
      [`toolkit:${box}`, 'PUT'],
      [`toolkit:${store.toolkitItemId('walk')}`, 'PUT'],
    ]);
    store.toggleTool('box');
    expect(calls().at(-1)).toMatchObject({ key: `toolkit:${box}`, method: 'DELETE' });
  });

  it('never lets an older server copy bring back a card removed on this phone', () => {
    const store = loadStore();
    store.saveTools(['box']);
    store.toggleTool('box');
    const item = { id: store.toolkitItemId('box'), cardId: 'box', deletedAt: null };
    store.applyServerToolkit([{ ...item, updatedAt: '2000-01-01T00:00:00.000Z' }]);
    expect(store.getToolkit()).toEqual([]);
    store.applyServerToolkit([
      { ...item, cardId: 'friend', id: 'x', updatedAt: '2999-01-01T00:00:00.000Z' },
    ]);
    expect(store.getToolkit()).toEqual(['friend']);
  });
});

describe('tool uses and stress log sync', () => {
  it('queues each use and each stress entry with an id', () => {
    const store = loadStore();
    store.logToolUse('walk', 2, new Date('2026-11-28T09:00:00Z'));
    store.addStressEntry({ situation: 'Exam', level: 70, helped: 'A walk' });
    expect(calls().map((c) => c.key)).toEqual([
      'tool-uses:00000000-0000-4000-8000-000000000001',
      'stress-entries:00000000-0000-4000-8000-000000000002',
    ]);
    expect(calls()[1].body).toMatchObject({ situation: 'Exam', level: 70, helped: 'A walk' });
  });

  it('gives uses and entries from before sync an id', () => {
    mockMemory.set('coping_uses', [{ cardId: 'walk', helped: 1, at: '2026-11-01T09:00:00.000Z' }]);
    mockMemory.set('stress_log', [
      { id: 'stress-1', situation: 'Old', at: '2026-11-01T09:00:00.000Z' },
    ]);
    const store = loadStore();
    expect(store.getStressLog()[0].id).toMatch(/^0{8}-/);
    expect((mockMemory.get('coping_uses') as { id: string }[])[0].id).toMatch(/^0{8}-/);
  });
});

describe('crisis plan', () => {
  it('sends only how many parts are filled in, never the plan', () => {
    const store = loadStore();
    store.saveCrisisPlan({ warning: ['I stop replying'], people: ['Mum|0803'] });
    expect(calls()).toEqual([
      expect.objectContaining({
        key: 'crisis-plan-progress',
        method: 'PUT',
        body: { partsFilled: 2, updatedAt: expect.any(String) },
      }),
    ]);
    expect(JSON.stringify(calls())).not.toMatch(/replying|Mum|0803/);
  });

  it('counts a plan made before sync once, on the first upload', () => {
    mockMemory.set('crisis_plan', { warning: ['I stop replying'] });
    const store = loadStore();
    store.uploadLocalToolkit([]);
    store.uploadLocalToolkit([]);
    expect(calls().filter((c) => c.key === 'crisis-plan-progress')).toHaveLength(1);
  });
});
