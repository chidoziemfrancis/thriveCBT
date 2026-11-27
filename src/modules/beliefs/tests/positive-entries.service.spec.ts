import type { PositiveEntry } from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { savePositiveEntrySchema } from '../dto/positive-entry.dto.js';
import type { PositiveEntriesRepository } from '../repositories/positive-entries.repository.js';
import { PositiveEntriesService } from '../services/positive-entries.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-27T10:00:00.000Z';

function setup() {
  const rows = new Map<string, PositiveEntry>();
  const repository = {
    find: vi.fn(async (id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async () => [...rows.values()]),
    save: vi.fn(
      async (id: string, studentId: string, data: Partial<PositiveEntry>) => {
        const row = {
          id,
          studentId,
          deletedAt: null,
          ...data,
          syncedAt: new Date(),
        } as PositiveEntry;
        rows.set(id, row);
        return row;
      },
    ),
    markDeleted: vi.fn(async (id: string, now: Date) => {
      const row = {
        ...rows.get(id)!,
        deletedAt: now,
        updatedAt: now,
        text: null,
      };
      rows.set(id, row);
      return row;
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 5).toString('base64'));
  const service = new PositiveEntriesService(
    repository as unknown as PositiveEntriesRepository,
    cipher,
  );
  return { service, rows };
}

const body = {
  kind: 'win' as const,
  text: 'Finished my essay early',
  at: T1,
  updatedAt: T1,
};

describe('PositiveEntriesService', () => {
  it('stores the text encrypted and returns it with its kind', async () => {
    const { service, rows } = setup();
    await expect(service.save('s1', ID, body)).resolves.toMatchObject({
      id: ID,
      kind: 'win',
      text: 'Finished my essay early',
    });
    expect(rows.get(ID)!.kind).toBe('WIN');
    expect(rows.get(ID)!.text).not.toContain('essay');
  });

  it('erases the text on delete, leaving a marker', async () => {
    const { service } = setup();
    await service.save('s1', ID, body);
    await service.remove('s1', ID, new Date(T1));
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ text: '', deletedAt: T1 }],
    });
  });

  it('needs some text and a known kind', () => {
    expect(
      savePositiveEntrySchema.safeParse({ ...body, text: '  ' }).success,
    ).toBe(false);
    expect(
      savePositiveEntrySchema.safeParse({ ...body, kind: 'brag' }).success,
    ).toBe(false);
  });
});
