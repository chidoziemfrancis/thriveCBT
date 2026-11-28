import type { CrisisPlanProgress } from '../../../../generated/prisma/client.js';
import { saveCrisisPlanProgressSchema } from '../dto/crisis-plan-progress.dto.js';
import type { CrisisPlanRepository } from '../repositories/crisis-plan.repository.js';
import { CrisisPlanService } from '../services/crisis-plan.service.js';

const T1 = '2026-11-28T10:00:00.000Z';
const T2 = '2026-11-28T11:00:00.000Z';

function setup() {
  let saved: CrisisPlanProgress | null = null;
  const repository = {
    find: vi.fn(async () => saved),
    save: vi.fn(
      async (
        studentId: string,
        data: { partsFilled: number; updatedAt: Date },
      ) => {
        saved = {
          studentId,
          ...data,
          syncedAt: new Date(),
          createdAt: new Date(),
        };
        return saved;
      },
    ),
  };
  return {
    service: new CrisisPlanService(
      repository as unknown as CrisisPlanRepository,
    ),
  };
}

describe('CrisisPlanService', () => {
  it('keeps only how many parts are filled in, newest first', async () => {
    const { service } = setup();
    await expect(
      service.save('s1', { partsFilled: 2, updatedAt: T1 }),
    ).resolves.toEqual({
      partsFilled: 2,
      updatedAt: T1,
    });
    await service.save('s1', { partsFilled: 6, updatedAt: T2 });
    await expect(
      service.save('s1', { partsFilled: 1, updatedAt: T1 }),
    ).rejects.toMatchObject({
      code: 'SYNC_STALE_UPDATE',
    });
  });

  it('takes 0 to 6 parts, and nothing else from the plan', () => {
    expect(
      saveCrisisPlanProgressSchema.safeParse({ partsFilled: 7, updatedAt: T1 })
        .success,
    ).toBe(false);
    expect(
      saveCrisisPlanProgressSchema.safeParse({
        partsFilled: 3,
        updatedAt: T1,
        contacts: ['Mum'],
      }),
    ).toMatchObject({ success: true, data: { partsFilled: 3, updatedAt: T1 } });
  });
});
