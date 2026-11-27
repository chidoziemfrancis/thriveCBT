import type { PlannedActivity } from '../../../generated/prisma/client.js';
import { savePlannedActivitySchema } from '../dto/planned-activity.dto.js';
import type {
  PlannedActivitiesRepository,
  PlannedActivityData,
} from '../repositories/planned-activities.repository.js';
import { PlannedActivitiesService } from '../services/planned-activities.service.js';

const ID = '01a21c8f-b277-72a8-bfc1-b9599ad4a318';
const T1 = '2026-11-27T10:00:00.000Z';
const T2 = '2026-11-28T19:00:00.000Z';

function setup() {
  const rows = new Map<string, PlannedActivity>();
  const repository = {
    find: vi.fn(async (id: string) => rows.get(id) ?? null),
    changedSince: vi.fn(async () => [...rows.values()]),
    save: vi.fn(
      async (id: string, studentId: string, data: PlannedActivityData) => {
        const row = {
          id,
          studentId,
          ...data,
          syncedAt: new Date(),
        } as PlannedActivity;
        rows.set(id, row);
        return row;
      },
    ),
    markDeleted: vi.fn(async (id: string, now: Date) => {
      const row = { ...rows.get(id)!, deletedAt: now, updatedAt: now };
      rows.set(id, row);
      return row;
    }),
  };
  return {
    service: new PlannedActivitiesService(
      repository as unknown as PlannedActivitiesRepository,
    ),
    rows,
  };
}

const plan = {
  date: '2026-11-28',
  slot: 'morning' as const,
  label: 'Take a walk on campus',
  predicted: 4,
  sessionId: 5,
  updatedAt: T1,
};

describe('PlannedActivitiesService', () => {
  it('saves a plan, then the same plan ticked off and rated', async () => {
    const { service, rows } = setup();
    await expect(service.save('s1', ID, plan)).resolves.toMatchObject({
      id: ID,
      date: '2026-11-28',
      slot: 'morning',
      predicted: 4,
      doneAt: null,
      enjoy: null,
    });
    expect(rows.get(ID)!.slot).toBe('MORNING');
    await expect(
      service.save('s1', ID, {
        ...plan,
        doneAt: T2,
        enjoy: 8,
        achieve: 6,
        updatedAt: T2,
      }),
    ).resolves.toMatchObject({ doneAt: T2, enjoy: 8, achieve: 6 });
  });

  it('never lets an older copy undo a rating from another phone', async () => {
    const { service } = setup();
    await service.save('s1', ID, {
      ...plan,
      doneAt: T2,
      enjoy: 8,
      achieve: 6,
      updatedAt: T2,
    });
    await expect(service.save('s1', ID, plan)).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
      details: { current: { enjoy: 8 } },
    });
  });

  it('brings a removed plan back when the student plans it again', async () => {
    const { service } = setup();
    await service.save('s1', ID, plan);
    await service.remove('s1', ID, new Date(T1));
    await expect(
      service.save('s1', ID, { ...plan, updatedAt: T2 }),
    ).resolves.toMatchObject({ deletedAt: null, label: plan.label });
  });

  it('deletes with a marker and hides another student’s plan', async () => {
    const { service } = setup();
    await service.save('s1', ID, plan);
    await expect(service.remove('s2', ID)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await service.remove('s1', ID, new Date(T2));
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ id: ID, deletedAt: T2 }],
    });
  });
});

describe('plan checks', () => {
  it('need a real date, a known slot and scores from 0 to 10', () => {
    const ok = (over: object) =>
      savePlannedActivitySchema.safeParse({ ...plan, ...over }).success;
    expect(ok({})).toBe(true);
    expect(ok({ date: '28/11/2026' })).toBe(false);
    expect(ok({ slot: 'night' })).toBe(false);
    expect(ok({ enjoy: 11 })).toBe(false);
    expect(ok({ label: ' ' })).toBe(false);
  });
});
