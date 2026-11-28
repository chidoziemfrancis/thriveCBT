import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));
const mockQueue = jest.fn<(change: unknown) => void>();
jest.mock('@/lib/sync', () => ({
  ...jest.requireActual<object>('@/lib/sync/items'),
  queueChange: (change: unknown) => mockQueue(change),
  registerSyncKind: () => undefined,
}));

import { planId, toPlanned } from '@/features/activities/utils/activities';
import { isUuid } from '@/lib/sync/items';

type Store = typeof import('@/features/activities/store/activityStore');
function loadStore(): Store {
  let store!: Store;
  jest.isolateModules(() => {
    store = require('@/features/activities/store/activityStore');
  });
  return store;
}

const walk = {
  date: '2026-11-28',
  slot: 'morning' as const,
  label: 'Take a walk on campus',
  predicted: 4,
};

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
});

describe('plan ids', () => {
  it('are proper UUIDs, the same for the same day, slot and activity', () => {
    expect(isUuid(planId(walk))).toBe(true);
    // Pinned: changing how ids are made would split every saved plan from its server copy.
    expect(planId(walk)).toBe('8eae270e-8079-8706-8b21-fe957f790203');
    expect(planId({ ...walk, predicted: 9 })).toBe(planId(walk));
    expect(planId({ ...walk, label: ' take a walk on CAMPUS ' })).toBe(planId(walk));
    expect(planId({ ...walk, slot: 'evening' })).not.toBe(planId(walk));
    expect(planId({ ...walk, date: '2026-11-29' })).not.toBe(planId(walk));
  });
});

describe('My week sync', () => {
  it('queues a new plan, then the whole plan again when it’s ticked off and rated', () => {
    const store = loadStore();
    store.addPlans([toPlanned(walk, 5)]);
    const id = planId(walk);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: `planned-activities:${id}`,
        method: 'PUT',
        path: `/me/planned-activities/${id}`,
        body: expect.objectContaining({ ...walk, sessionId: 5, doneAt: null, enjoy: null }),
      })
    );
    store.completeActivity(id, 8, 6, new Date('2026-11-28T09:00:00Z'));
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          label: walk.label,
          doneAt: '2026-11-28T09:00:00.000Z',
          enjoy: 8,
          achieve: 6,
        }),
      })
    );
    store.removeActivity(id);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: `planned-activities:${id}`, method: 'DELETE' })
    );
  });

  it('doesn’t resend a plan that’s already saved', () => {
    const store = loadStore();
    store.addPlans([toPlanned(walk)]);
    store.addPlans([toPlanned(walk)]);
    expect(mockQueue).toHaveBeenCalledTimes(1);
  });

  it('gives plans from before sync the same id a new plan would get', () => {
    mockMemory.set('planned_activities', [
      { ...walk, id: 'plan-2026-11-28-morning-take-a-walk-on-campus' },
    ]);
    expect(loadStore().getPlannedActivities()[0].id).toBe(planId(walk));
  });

  it('takes a rating made on another phone and removes plans deleted there', () => {
    const store = loadStore();
    store.addPlans([toPlanned(walk)]);
    const id = planId(walk);
    const server = {
      id,
      ...walk,
      sessionId: null,
      doneAt: '2026-11-28T09:00:00.000Z',
      enjoy: 7,
      achieve: 5,
      updatedAt: '2999-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    store.applyServerPlans([server]);
    expect(store.getPlannedActivities()[0]).toMatchObject({ enjoy: 7, achieve: 5 });
    store.applyServerPlans([
      { ...server, deletedAt: '2999-01-02T00:00:00.000Z', updatedAt: '2999-01-02T00:00:00.000Z' },
    ]);
    expect(store.getPlannedActivities()).toEqual([]);
  });
});
