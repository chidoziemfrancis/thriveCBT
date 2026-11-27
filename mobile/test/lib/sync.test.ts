import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/storage', () => {
  const memory = new Map<string, unknown>();
  return {
    memory,
    readJson: (key: string, fallback: unknown) => (memory.has(key) ? memory.get(key) : fallback),
    writeJson: (key: string, value: unknown) => memory.set(key, structuredClone(value)),
    removeKey: (key: string) => memory.delete(key),
  };
});
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: () => null,
    setItemSync: () => undefined,
    removeItemSync: () => undefined,
  },
}));

const mockPut = jest.fn<(path: string, body: unknown) => Promise<{ data: unknown }>>();
const mockDelete = jest.fn<(path: string) => Promise<{ data: unknown }>>();
const mockGet =
  jest.fn<(path: string, config?: { params?: { since?: string } }) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({
  api: {
    put: (path: string, body: unknown) => mockPut(path, body),
    delete: (path: string) => mockDelete(path),
    get: (path: string, config?: { params?: { since?: string } }) => mockGet(path, config),
  },
}));

import { ApiError } from '@/lib/api-error';
import { queueChange, registerSyncKind, syncNow } from '@/lib/sync';
import { readQueue, retryDelay } from '@/lib/sync/queue';
import { useSessionStore } from '@/stores/session.store';

const memory = (jest.requireMock('@/lib/storage') as { memory: Map<string, unknown> }).memory;
const applied: unknown[][] = [];
const uploaded: unknown[][] = [];
let cleared = 0;

registerSyncKind<{ id: string }>({
  name: 'things',
  path: '/me/things',
  applyServerItems: (items) => applied.push(items),
  uploadLocal: (items) => uploaded.push(items),
  clearLocal: () => {
    cleared += 1;
  },
});

function signIn(id = 's1', role: 'student' | 'researcher' = 'student') {
  useSessionStore.getState().signIn('token', {
    id,
    email: `${id}@uni.edu`,
    role,
    status: 'active',
    createdAt: '2026-11-01T00:00:00.000Z',
    emailVerified: true,
  });
}

const change = (key: string, body: unknown = { v: key }) => ({
  key,
  kind: 'things',
  method: 'PUT' as const,
  path: `/me/things/${key}`,
  body,
});

beforeEach(() => {
  jest.useFakeTimers();
  memory.clear();
  applied.length = 0;
  uploaded.length = 0;
  cleared = 0;
  mockPut.mockReset().mockResolvedValue({ data: {} });
  mockDelete.mockReset().mockResolvedValue({ data: {} });
  mockGet.mockReset().mockResolvedValue({ data: { items: [], serverTime: 'T1' } });
  signIn();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('the queue', () => {
  it('keeps one waiting change per thing, the newest', () => {
    queueChange(change('a', { v: 1 }));
    queueChange(change('b'));
    queueChange(change('a', { v: 2 }));
    expect(readQueue().map((c) => [c.key, c.body])).toEqual([
      ['b', { v: 'b' }],
      ['a', { v: 2 }],
    ]);
  });

  it('waits longer after each failure, up to 5 minutes', () => {
    expect([1, 2, 3].map(retryDelay)).toEqual([5_000, 10_000, 20_000]);
    expect(retryDelay(20)).toBe(300_000);
  });
});

describe('syncNow', () => {
  it('sends waiting changes oldest first, then pulls', async () => {
    queueChange(change('a'));
    queueChange(change('b'));
    await syncNow();
    expect(mockPut.mock.calls.map((c) => c[0])).toEqual(['/me/things/a', '/me/things/b']);
    expect(readQueue()).toEqual([]);
    expect(mockGet).toHaveBeenCalledWith('/me/things', { params: undefined });
  });

  it('keeps changes on the phone when offline, and tries again later', async () => {
    mockPut.mockRejectedValue(new ApiError('NETWORK_ERROR', 'offline'));
    queueChange(change('a'));
    queueChange(change('b'));
    await syncNow();
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(readQueue().map((c) => [c.key, c.attempts])).toEqual([
      ['a', 1],
      ['b', 0],
    ]);
  });

  it('takes the server’s copy when a newer change was already saved', async () => {
    mockPut.mockRejectedValueOnce(
      new ApiError('SYNC_STALE_UPDATE', 'stale', 409, { current: { id: 'a', v: 'server' } })
    );
    queueChange(change('a'));
    await syncNow();
    expect(applied[0]).toEqual([{ id: 'a', v: 'server' }]);
    expect(readQueue()).toEqual([]);
  });

  it('drops a change the server will never accept, and carries on', async () => {
    mockPut.mockRejectedValueOnce(new ApiError('VALIDATION_FAILED', 'bad', 400));
    queueChange(change('a'));
    queueChange(change('b'));
    await syncNow();
    expect(mockPut).toHaveBeenCalledTimes(2);
    expect(readQueue()).toEqual([]);
  });

  it('keeps a newer change made while an older one was being sent', async () => {
    mockPut.mockImplementationOnce(async () => {
      queueChange(change('a', { v: 'newer' }));
      return { data: {} };
    });
    queueChange(change('a', { v: 'older' }));
    await syncNow();
    expect(mockPut.mock.calls.map((c) => c[1])).toEqual([{ v: 'older' }, { v: 'newer' }]);
  });

  it('uploads local data on the first pull only, then asks for changes since the server time', async () => {
    await syncNow();
    expect(uploaded).toHaveLength(1);
    await syncNow();
    expect(uploaded).toHaveLength(1);
    expect(mockGet).toHaveBeenLastCalledWith('/me/things', { params: { since: 'T1' } });
  });

  it('does nothing for anyone but a signed-in student', async () => {
    useSessionStore.getState().signOut();
    queueChange(change('a'));
    await syncNow();
    signIn('r1', 'researcher');
    await syncNow();
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('clears one student’s data before another student syncs on the same phone', async () => {
    await syncNow();
    expect(cleared).toBe(0);
    useSessionStore.getState().signOut();
    queueChange(change('a'));
    signIn('s2');
    await syncNow();
    expect(cleared).toBe(1);
    expect(mockPut).not.toHaveBeenCalled();
    expect(uploaded).toHaveLength(2);
  });
});
