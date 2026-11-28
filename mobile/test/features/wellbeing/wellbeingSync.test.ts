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
  onStudentChange: () => undefined,
}));

function load<T>(path: string): T {
  let store!: T;
  jest.isolateModules(() => {
    store = require(path);
  });
  return store;
}
type Plan = typeof import('@/features/wellbeing/store/wellPlanStore');
type Contact = typeof import('@/features/profile/store/emergencyContactStore');

const goal = {
  area: 'study',
  goal: 'Finish project',
  steps: ['Outline', 'Draft'],
  date: '2026-12-20',
};
const OLD = '2000-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';

beforeEach(() => {
  mockMemory.clear();
  mockQueue.mockReset();
});

describe('staying-well plan sync', () => {
  it('sends the whole plan whenever it changes, including a ticked step', () => {
    const store = load<Plan>('@/features/wellbeing/store/wellPlanStore');
    store.saveWellPlan({ triggers: ['Exams'], goal });
    store.toggleGoalStep(1);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'well-plan',
        method: 'PUT',
        path: '/me/well-plan',
        body: expect.objectContaining({
          triggers: ['Exams'],
          goal: { ...goal, done: [1] },
          updatedAt: expect.any(String),
        }),
      })
    );
  });

  it('takes a newer plan from the server, and keeps a newer one made here', () => {
    const store = load<Plan>('@/features/wellbeing/store/wellPlanStore');
    store.saveWellPlan({ note: 'Mine' });
    store.applyServerWellPlan([{ note: 'Old', updatedAt: OLD, deletedAt: null }]);
    expect(store.getWellPlan()).toEqual({ note: 'Mine' });
    store.applyServerWellPlan([{ note: 'Tablet', updatedAt: FUTURE, deletedAt: null }]);
    expect(store.getWellPlan()).toEqual({ note: 'Tablet' });
  });

  it('uploads a plan from before sync only when the server has none', () => {
    mockMemory.set('wellbeing_plan', { note: 'Before sync' });
    const store = load<Plan>('@/features/wellbeing/store/wellPlanStore');
    store.uploadLocalWellPlan([{ note: 'x', updatedAt: OLD, deletedAt: null }]);
    expect(mockQueue).not.toHaveBeenCalled();
    store.uploadLocalWellPlan([]);
    expect(mockQueue).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ note: 'Before sync' }) })
    );
  });
});

describe('emergency contact sync', () => {
  const contact = { name: 'Ngozi Eze', relationship: 'Aunt', phone: '0803 555 0101' };

  it('sends the contact when saved and a delete when removed', () => {
    const store = load<Contact>('@/features/profile/store/emergencyContactStore');
    store.saveEmergencyContact(contact);
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'emergency-contact',
        method: 'PUT',
        body: expect.objectContaining(contact),
      })
    );
    store.removeEmergencyContact();
    expect(mockQueue).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 'emergency-contact', method: 'DELETE' })
    );
  });

  it('takes a contact, or its removal, from another phone when newer', () => {
    const store = load<Contact>('@/features/profile/store/emergencyContactStore');
    store.applyServerEmergencyContact([{ ...contact, updatedAt: FUTURE, deletedAt: null }]);
    expect(store.getEmergencyContact()).toEqual(contact);
    store.applyServerEmergencyContact([
      {
        name: '',
        relationship: '',
        phone: '',
        updatedAt: '2999-01-02T00:00:00.000Z',
        deletedAt: '2999-01-02T00:00:00.000Z',
      },
    ]);
    expect(store.getEmergencyContact()).toBeNull();
  });
});
