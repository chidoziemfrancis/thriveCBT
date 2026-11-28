import type {
  ToolkitItem,
  ToolUse,
} from '../../../../generated/prisma/client.js';
import { saveToolUseSchema } from '../dto/toolkit.dto.js';
import type { ToolkitRepository } from '../repositories/toolkit.repository.js';
import { ToolkitService } from '../services/toolkit.service.js';

const ID = '01a21c8f-b277-82a8-bfc1-b9599ad4a318';
const T1 = '2026-11-28T10:00:00.000Z';
const T2 = '2026-11-28T11:00:00.000Z';

function setup() {
  const items = new Map<string, ToolkitItem>();
  const uses = new Map<string, ToolUse>();
  const key = (studentId: string, id: string) => `${studentId}:${id}`;
  const repository = {
    findItem: vi.fn(
      async (s: string, id: string) => items.get(key(s, id)) ?? null,
    ),
    itemsChangedSince: vi.fn(async (s: string) =>
      [...items.values()].filter((r) => r.studentId === s),
    ),
    saveItem: vi.fn(
      async (
        s: string,
        id: string,
        data: { cardId: string; updatedAt: Date },
      ) => {
        const row = {
          studentId: s,
          id,
          ...data,
          deletedAt: null,
          syncedAt: new Date(),
        } as ToolkitItem;
        items.set(key(s, id), row);
        return row;
      },
    ),
    deleteItem: vi.fn(async (s: string, id: string, now: Date) => {
      items.set(key(s, id), {
        ...items.get(key(s, id))!,
        deletedAt: now,
        updatedAt: now,
      });
    }),
    findUse: vi.fn(
      async (s: string, id: string) => uses.get(key(s, id)) ?? null,
    ),
    usesChangedSince: vi.fn(async (s: string) =>
      [...uses.values()].filter((r) => r.studentId === s),
    ),
    saveUse: vi.fn(async (s: string, id: string, data: Partial<ToolUse>) => {
      const row = {
        studentId: s,
        id,
        deletedAt: null,
        ...data,
        syncedAt: new Date(),
      } as ToolUse;
      uses.set(key(s, id), row);
      return row;
    }),
    deleteUse: vi.fn(),
  };
  return {
    service: new ToolkitService(repository as unknown as ToolkitRepository),
  };
}

describe('ToolkitService', () => {
  it('keeps a card, removes it, and brings it back when kept again', async () => {
    const { service } = setup();
    await service.saveItem('s1', ID, { cardId: 'breathe', updatedAt: T1 });
    await service.removeItem('s1', ID, new Date(T1));
    await expect(service.listItems('s1', {})).resolves.toMatchObject({
      items: [{ cardId: 'breathe', deletedAt: T1 }],
    });
    await expect(
      service.saveItem('s1', ID, { cardId: 'breathe', updatedAt: T2 }),
    ).resolves.toMatchObject({ cardId: 'breathe', deletedAt: null });
  });

  it('lets two students keep the same card with the same id', async () => {
    const { service } = setup();
    await service.saveItem('s1', ID, { cardId: 'breathe', updatedAt: T1 });
    await expect(
      service.saveItem('s2', ID, { cardId: 'breathe', updatedAt: T1 }),
    ).resolves.toMatchObject({ cardId: 'breathe' });
    await expect(service.listItems('s1', {})).resolves.toMatchObject({
      items: [{}],
    });
  });

  it('records how much a card helped', async () => {
    const { service } = setup();
    await expect(
      service.saveUse('s1', ID, {
        cardId: 'walk',
        helped: 2,
        at: T1,
        updatedAt: T1,
      }),
    ).resolves.toMatchObject({ cardId: 'walk', helped: 2, at: T1 });
    expect(
      saveToolUseSchema.safeParse({
        cardId: 'walk',
        helped: 3,
        at: T1,
        updatedAt: T1,
      }).success,
    ).toBe(false);
  });
});
