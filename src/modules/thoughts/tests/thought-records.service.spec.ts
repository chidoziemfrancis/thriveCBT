import type { ThoughtRecord } from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { saveThoughtRecordSchema } from '../dto/thought-record.dto.js';
import type {
  ThoughtRecordData,
  ThoughtRecordsRepository,
} from '../repositories/thought-records.repository.js';
import { ThoughtRecordsService } from '../services/thought-records.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-27T10:00:00.000Z';

function setup() {
  const rows = new Map<string, ThoughtRecord>();
  const repository = {
    find: vi.fn(async (id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async () => [...rows.values()]),
    save: vi.fn(
      async (id: string, studentId: string, data: ThoughtRecordData) => {
        const row = {
          id,
          studentId,
          deletedAt: null,
          ...data,
          syncedAt: new Date(),
        } as ThoughtRecord;
        rows.set(id, row);
        return row;
      },
    ),
    markDeleted: vi.fn(async (id: string, now: Date) => {
      const row = {
        ...rows.get(id)!,
        deletedAt: now,
        updatedAt: now,
        situation: null,
        thought: null,
        action: null,
        balanced: null,
        feeling: [],
        traps: [],
        beliefBefore: null,
        beliefAfter: null,
      };
      rows.set(id, row);
      return row;
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 3).toString('base64'));
  const service = new ThoughtRecordsService(
    repository as unknown as ThoughtRecordsRepository,
    cipher,
  );
  return { service, rows };
}

const body = {
  situation: 'Group chat went quiet after my message',
  thought: 'Everyone thinks I’m annoying',
  feeling: ['anxious', 'Worried', '70'],
  action: 'Left the chat',
  traps: ['mind-reading'],
  sessionId: 3,
  balanced: 'People are busy; it isn’t about me',
  beliefBefore: 80,
  beliefAfter: 30,
  at: T1,
  updatedAt: T1,
};

describe('ThoughtRecordsService', () => {
  it('encrypts what the student wrote, keeps choices readable, and gives it all back', async () => {
    const { service, rows } = setup();
    await expect(service.save('s1', ID, body)).resolves.toMatchObject({
      situation: body.situation,
      thought: body.thought,
      action: 'Left the chat',
      balanced: body.balanced,
      feeling: body.feeling,
      traps: ['mind-reading'],
      beliefBefore: 80,
      beliefAfter: 30,
    });
    const stored = rows.get(ID)!;
    for (const field of [
      stored.situation,
      stored.thought,
      stored.action,
      stored.balanced,
    ]) {
      expect(field).toMatch(/^v1:/);
    }
    expect(JSON.stringify(stored)).not.toMatch(
      /annoying|quiet|busy|Left the chat/,
    );
    expect(stored.traps).toEqual(['mind-reading']);
  });

  it('keeps optional writing empty when it wasn’t given', async () => {
    const { service } = setup();
    await expect(
      service.save('s1', ID, { ...body, action: null, balanced: undefined }),
    ).resolves.toMatchObject({ action: null, balanced: null });
  });

  it('erases the writing on delete and hides another student’s record', async () => {
    const { service, rows } = setup();
    await service.save('s1', ID, body);
    await expect(service.remove('s2', ID)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await service.remove('s1', ID, new Date(T1));
    expect(rows.get(ID)).toMatchObject({
      situation: null,
      thought: null,
      feeling: [],
    });
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ situation: '', thought: '', deletedAt: T1 }],
    });
  });

  it('checks beliefs are 0 to 100', () => {
    expect(
      saveThoughtRecordSchema.safeParse({ ...body, beliefAfter: 101 }).success,
    ).toBe(false);
  });
});
