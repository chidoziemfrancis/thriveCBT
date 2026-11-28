import type { WellPlan } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { saveWellPlanSchema } from '../dto/well-plan.dto.js';
import type { WellPlanRepository } from '../repositories/well-plan.repository.js';
import { WellPlanService } from '../services/well-plan.service.js';

const T1 = '2026-11-28T10:00:00.000Z';
const T2 = '2026-11-28T11:00:00.000Z';

function setup() {
  let row: WellPlan | null = null;
  const repository = {
    find: vi.fn(async () => row),
    save: vi.fn(async (studentId: string, data: string, updatedAt: Date) => {
      row = {
        studentId,
        data,
        updatedAt,
        syncedAt: new Date(),
        createdAt: new Date(),
      };
      return row;
    }),
  };
  const cipher = new FieldCipher(Buffer.alloc(32, 4).toString('base64'));
  return {
    service: new WellPlanService(
      repository as unknown as WellPlanRepository,
      cipher,
    ),
    stored: () => row,
  };
}

const plan = {
  triggers: ['Exams piling up'],
  signs: ['I stop going to lectures'],
  actions: ['Call my sister'],
  people: ['Tobi'],
  note: 'You got through it last time',
  goal: {
    area: 'study',
    goal: 'Finish my project',
    steps: ['Outline', 'Draft'],
    date: '2026-12-20',
    done: [0],
  },
};

describe('WellPlanService', () => {
  it('stores the whole plan encrypted and gives it back as it was', async () => {
    const { service, stored } = setup();
    await expect(
      service.save('s1', { ...plan, updatedAt: T1 }),
    ).resolves.toEqual({
      ...plan,
      updatedAt: T1,
      deletedAt: null,
    });
    expect(stored()!.data).toMatch(/^v1:/);
    expect(stored()!.data).not.toMatch(/sister|Exams|project/);
  });

  it('keeps the newest version and refuses an older one', async () => {
    const { service } = setup();
    await service.save('s1', { ...plan, note: 'Newer', updatedAt: T2 });
    await expect(
      service.save('s1', { ...plan, updatedAt: T1 }),
    ).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
      details: { current: { note: 'Newer' } },
    });
  });

  it('lists the plan only when it changed since the last pull', async () => {
    const { service } = setup();
    await expect(service.list('s1', {})).resolves.toMatchObject({ items: [] });
    await service.save('s1', { ...plan, updatedAt: T1 });
    await expect(service.list('s1', {})).resolves.toMatchObject({
      items: [{ note: plan.note }],
    });
    await expect(
      service.list('s1', { since: '2999-01-01T00:00:00.000Z' }),
    ).resolves.toMatchObject({
      items: [],
    });
  });

  it('accepts an empty plan but not an unbounded one', () => {
    expect(saveWellPlanSchema.safeParse({ updatedAt: T1 }).success).toBe(true);
    expect(
      saveWellPlanSchema.safeParse({ note: 'x'.repeat(1001), updatedAt: T1 })
        .success,
    ).toBe(false);
  });
});
