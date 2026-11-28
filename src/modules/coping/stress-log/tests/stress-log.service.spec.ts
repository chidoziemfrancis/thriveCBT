import type { StressEntry } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { saveStressEntrySchema } from '../dto/stress-entry.dto.js';
import type { StressLogRepository } from '../repositories/stress-log.repository.js';
import { StressLogService } from '../services/stress-log.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-28T10:00:00.000Z';

function setup() {
  const rows = new Map<string, StressEntry>();
  const repository = {
    find: vi.fn(async (_s: string, id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async () => [...rows.values()]),
    save: vi.fn(async (s: string, id: string, data: Partial<StressEntry>) => {
      const row = {
        studentId: s,
        id,
        deletedAt: null,
        ...data,
        syncedAt: new Date(),
      } as StressEntry;
      rows.set(id, row);
      return row;
    }),
    markDeleted: vi.fn(async (_s: string, id: string, now: Date) => {
      rows.set(id, {
        ...rows.get(id)!,
        deletedAt: now,
        updatedAt: now,
        situation: null,
        helped: null,
        level: null,
      });
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 9).toString('base64'));
  return {
    service: new StressLogService(
      repository as unknown as StressLogRepository,
      cipher,
    ),
    rows,
  };
}

const body = {
  situation: 'Group presentation tomorrow',
  level: 70,
  helped: 'Called my sister',
  at: T1,
  updatedAt: T1,
};

describe('StressLogService', () => {
  it('encrypts what happened and what helped, keeping the level readable', async () => {
    const { service, rows } = setup();
    await expect(service.save('s1', ID, body)).resolves.toMatchObject(body);
    const stored = rows.get(ID)!;
    expect(stored.situation).toMatch(/^v1:/);
    expect(stored.helped).toMatch(/^v1:/);
    expect(JSON.stringify(stored)).not.toMatch(/presentation|sister/);
    expect(stored.level).toBe(70);
  });

  it('erases the writing when deleted', async () => {
    const { service } = setup();
    await service.save('s1', ID, body);
    await service.remove('s1', ID, new Date(T1));
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ situation: '', helped: null, level: null, deletedAt: T1 }],
    });
  });

  it('needs something written and a level from 0 to 100', () => {
    expect(
      saveStressEntrySchema.safeParse({ ...body, situation: ' ' }).success,
    ).toBe(false);
    expect(
      saveStressEntrySchema.safeParse({ ...body, level: 101 }).success,
    ).toBe(false);
  });
});
