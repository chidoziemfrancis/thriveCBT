import { describe, expect, it } from '@jest/globals';

import { isUuid, mergeServerItems, notOnServer, withUuids } from '@/lib/sync/items';

const U1 = '00000000-0000-4000-8000-000000000001';
const server = (id: string, updatedAt: string, deletedAt: string | null = null) => ({
  id,
  updatedAt,
  deletedAt,
  v: 'server',
});

describe('sync item helpers', () => {
  it('give old-style ids a UUID, and leave proper ones alone', () => {
    expect(isUuid(U1)).toBe(true);
    expect(withUuids([{ id: U1 }], () => 'x')).toBeNull();
    expect(withUuids([{ id: U1 }, { id: 'thought-1' }], () => 'new')).toEqual([
      { id: U1 },
      { id: 'new' },
    ]);
  });

  it('merge a pull: newest wins, deletions are removed, new items are added', () => {
    const local = [
      { id: 'a', updatedAt: '2026-11-27T12:00:00.000Z', v: 'phone' },
      { id: 'b', updatedAt: '2026-11-27T09:00:00.000Z', v: 'phone' },
      { id: 'c', v: 'phone' },
    ];
    const merged = mergeServerItems(
      local,
      [
        server('a', '2026-11-27T10:00:00.000Z'),
        server('b', '2026-11-27T10:00:00.000Z'),
        server('c', '2026-11-27T10:00:00.000Z', '2026-11-27T10:00:00.000Z'),
        server('d', '2026-11-27T10:00:00.000Z'),
      ],
      ({ id, updatedAt, v }) => ({ id, updatedAt, v })
    );
    expect(merged.map((i) => [i.id, i.v])).toEqual([
      ['a', 'phone'],
      ['b', 'server'],
      ['d', 'server'],
    ]);
  });

  it('find what the server is missing', () => {
    expect(notOnServer([{ id: 'a' }, { id: 'b' }], [{ id: 'a' }])).toEqual([{ id: 'b' }]);
  });
});
