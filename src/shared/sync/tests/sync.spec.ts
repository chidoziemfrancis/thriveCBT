import { assertCanChange, assertNotStale } from '../sync.js';
import { sinceQuerySchema } from '../sync.dto.js';

const at = (iso: string) => new Date(iso);

describe('assertNotStale', () => {
  it('lets a newer change, a repeat, or a first change through', () => {
    const saved = { updatedAt: at('2026-11-27T10:00:00Z') };
    expect(() =>
      assertNotStale(saved, at('2026-11-27T10:00:01Z'), () => saved),
    ).not.toThrow();
    expect(() =>
      assertNotStale(saved, at('2026-11-27T10:00:00Z'), () => saved),
    ).not.toThrow();
    expect(() =>
      assertNotStale(null, at('2020-01-01T00:00:00Z'), () => null),
    ).not.toThrow();
  });

  it('refuses an older change and hands back what is saved', () => {
    const saved = { updatedAt: at('2026-11-27T10:00:00Z') };
    expect(() =>
      assertNotStale(saved, at('2026-11-27T09:59:59Z'), () => ({
        done: ['a'],
      })),
    ).toThrow(
      expect.objectContaining({
        code: 'SYNC_STALE_UPDATE',
        status: 409,
        details: { current: { done: ['a'] } },
      }),
    );
  });
});

describe('since', () => {
  it('is optional and must be a real time', () => {
    expect(sinceQuerySchema.parse({})).toEqual({});
    expect(sinceQuerySchema.safeParse({ since: 'yesterday' }).success).toBe(
      false,
    );
  });
});

describe('assertCanChange', () => {
  const saved = (
    over: Partial<{ studentId: string; deletedAt: Date | null }> = {},
  ) => ({
    studentId: 's1',
    updatedAt: at('2026-11-27T10:00:00Z'),
    deletedAt: null,
    ...over,
  });

  it('lets the owner make a newer change', () => {
    expect(() =>
      assertCanChange(saved(), 's1', at('2026-11-27T11:00:00Z'), () => null),
    ).not.toThrow();
  });

  it('hides another student’s item', () => {
    expect(() =>
      assertCanChange(
        saved({ studentId: 's2' }),
        's1',
        at('2030-01-01T00:00:00Z'),
        () => null,
      ),
    ).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }));
  });

  it('keeps a deleted item deleted, sending the marker back', () => {
    expect(() =>
      assertCanChange(
        saved({ deletedAt: at('2026-11-27T10:30:00Z') }),
        's1',
        at('2030-01-01T00:00:00Z'),
        () => ({ deleted: true }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'SYNC_STALE_UPDATE',
        details: { current: { deleted: true } },
      }),
    );
  });
});
