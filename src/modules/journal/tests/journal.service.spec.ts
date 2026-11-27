import type { JournalEntry } from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { saveJournalSchema } from '../dto/journal.dto.js';
import type {
  JournalData,
  JournalRepository,
} from '../repositories/journal.repository.js';
import { JournalService } from '../services/journal.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-27T10:00:00.000Z';
const T2 = '2026-11-27T10:05:00.000Z';
const SECRET = 'I felt left out at lunch today';

function setup() {
  const rows = new Map<string, JournalEntry>();
  const repository = {
    find: vi.fn(async (id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async (studentId: string) =>
      [...rows.values()].filter((r) => r.studentId === studentId),
    ),
    save: vi.fn(async (id: string, studentId: string, data: JournalData) => {
      const row = {
        id,
        studentId,
        deletedAt: null,
        ...data,
        syncedAt: new Date(),
      } as JournalEntry;
      rows.set(id, row);
      return row;
    }),
    markDeleted: vi.fn(async (id: string, now: Date) => {
      const row = {
        ...rows.get(id)!,
        deletedAt: now,
        updatedAt: now,
        text: null,
        prompt: null,
        mood: null,
      };
      rows.set(id, row);
      return row;
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 7).toString('base64'));
  const service = new JournalService(
    repository as unknown as JournalRepository,
    cipher,
  );
  return { service, rows };
}

const body = (over: Record<string, unknown> = {}) => ({
  prompt: 'What went well today?',
  text: SECRET,
  mood: 2,
  sessionId: 3,
  at: T1,
  updatedAt: T1,
  ...over,
});

describe('JournalService', () => {
  it('stores the text encrypted and gives it back readable to the student', async () => {
    const { service, rows } = setup();
    await expect(service.save('s1', ID, body())).resolves.toMatchObject({
      id: ID,
      text: SECRET,
      prompt: 'What went well today?',
      mood: 2,
      sessionId: 3,
      editedAt: null,
    });
    const stored = rows.get(ID)!.text!;
    expect(stored).not.toContain('left out');
    expect(stored.startsWith('v1:')).toBe(true);
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ text: SECRET }],
    });
  });

  it('keeps edits newest-first and hides another student’s entry', async () => {
    const { service } = setup();
    await service.save(
      's1',
      ID,
      body({ updatedAt: T2, editedAt: T2, text: 'Edited' }),
    );
    await expect(service.save('s1', ID, body())).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
      details: { current: { text: 'Edited' } },
    });
    await expect(
      service.save('s2', ID, body({ updatedAt: '2030-01-01T00:00:00.000Z' })),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('erases the text when deleted and leaves only a marker', async () => {
    const { service, rows } = setup();
    await service.save('s1', ID, body());
    await service.remove('s1', ID, new Date(T2));
    expect(rows.get(ID)).toMatchObject({
      text: null,
      prompt: null,
      mood: null,
    });
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ id: ID, text: '', deletedAt: T2 }],
    });
  });
});

describe('journal checks', () => {
  it('take long entries but not unlimited ones', () => {
    expect(
      saveJournalSchema.safeParse(body({ text: 'x'.repeat(10_000) })).success,
    ).toBe(true);
    expect(
      saveJournalSchema.safeParse(body({ text: 'x'.repeat(10_001) })).success,
    ).toBe(false);
    expect(saveJournalSchema.safeParse(body({ sessionId: 9 })).success).toBe(
      false,
    );
  });
});
