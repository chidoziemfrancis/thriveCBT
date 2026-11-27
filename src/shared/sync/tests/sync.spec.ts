import { assertNotStale } from '../sync.js';
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
