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
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
}));

function loadStore() {
  let store!: typeof import('@/features/journal/store/journalStore');
  jest.isolateModules(() => {
    store = require('@/features/journal/store/journalStore');
  });
  return store;
}

const server = (id: string, updatedAt: string, over: Record<string, unknown> = {}) => ({
  id,
  prompt: null,
  text: 'From the tablet',
  mood: null,
  sessionId: null,
  at: '2026-11-26T09:00:00.000Z',
  editedAt: null,
  updatedAt,
  deletedAt: null,
  ...over,
});

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
  mockId = 0;
});

describe('journal sync', () => {
  it('queues new entries, edits and deletes for the server', () => {
    const store = loadStore();
    const created = store.addJournalEntry({ text: 'Okay day', mood: 2, sessionId: 3 });
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: `journal:${created.id}`,
        method: 'PUT',
        body: expect.objectContaining({ text: 'Okay day', mood: 2, sessionId: 3, prompt: null }),
      })
    );
    store.updateJournalEntry(created.id, { text: 'Better day', mood: 3 });
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ text: 'Better day' }) })
    );
    store.deleteJournalEntry(created.id);
    expect(mockQueue).toHaveBeenLastCalledWith({
      key: `journal:${created.id}`,
      kind: 'journal',
      method: 'DELETE',
      path: `/me/journal/${created.id}`,
    });
  });

  it('gives entries from before sync a proper id', () => {
    mockMemory.set('journal', [
      { id: 'entry-1730000000000', text: 'Old', at: '2026-10-01T09:00:00.000Z' },
    ]);
    const [old] = loadStore().getJournal();
    expect(old.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(old.text).toBe('Old');
  });

  it('takes newer server entries and removes ones deleted elsewhere', () => {
    const store = loadStore();
    const mine = store.addJournalEntry({ text: 'Mine' });
    store.applyServerJournal([
      server(mine.id, '2000-01-01T00:00:00.000Z', { text: 'Older copy' }),
      server('tablet', '2026-11-27T10:00:00.000Z', { sessionId: 2 }),
    ]);
    expect(store.getJournal().map((e) => [e.text, e.sessionId])).toEqual([
      ['From the tablet', 2],
      ['Mine', undefined],
    ]);
    store.applyServerJournal([
      server('tablet', '2026-11-27T11:00:00.000Z', { deletedAt: '2026-11-27T11:00:00.000Z' }),
    ]);
    expect(store.getJournal().map((e) => e.text)).toEqual(['Mine']);
  });

  it('uploads only entries the server doesn’t have', () => {
    mockMemory.set('journal', [
      { id: '00000000-0000-4000-8000-00000000000a', text: 'A', at: '2026-10-01T09:00:00.000Z' },
      { id: '00000000-0000-4000-8000-00000000000b', text: 'B', at: '2026-10-02T09:00:00.000Z' },
    ]);
    const store = loadStore();
    store.uploadLocalJournal([
      server('00000000-0000-4000-8000-00000000000a', '2026-11-27T10:00:00.000Z'),
    ]);
    expect(mockQueue.mock.calls.map((c) => (c[0] as { key: string }).key)).toEqual([
      'journal:00000000-0000-4000-8000-00000000000b',
    ]);
  });
});
