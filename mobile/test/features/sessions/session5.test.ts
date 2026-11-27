import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  dayName,
  nextSevenDays,
  planId,
  predictionGap,
  readPlan,
  readRatings,
  toPlanned,
  weekDays,
  writePlan,
  writeRatings,
} from '@/features/activities/utils/activities';
import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_5 } from '@/features/sessions/content/session5';
import type { PlannerStep, StepAnswer } from '@/features/sessions/content/types';
import { isStepReady, plannerSuggestions } from '@/features/sessions/utils/sessionLogic';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

function loadStore() {
  let store!: typeof import('@/features/activities/store/activityStore');
  jest.isolateModules(() => {
    store = require('@/features/activities/store/activityStore');
  });
  return store;
}

beforeEach(() => mockMemory.clear());

const steps = SESSION_5.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;
// 11 Nov 2026 is a Wednesday.
const wednesday = new Date(2026, 10, 11, 10);

describe('session 5 content', () => {
  it('is registered with its four parts and unique step ids', () => {
    expect(sessionContent(5)).toBe(SESSION_5);
    expect(SESSION_5.modules.map((m) => m.id)).toEqual(['loop', 'lift', 'smaller', 'plan']);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SESSION_5.practiceAction).toBe('plan');
  });
});

describe('picking and rating activities', () => {
  it('needs every pick rated both ways before moving on', () => {
    const answers: Record<string, StepAnswer> = { pick: ['Wash my clothes', 'Dance'] };
    const rate = find('rate-picks');
    const half = writeRatings([{ label: 'Wash my clothes', enjoy: 2, achieve: 8 }]);
    expect(isStepReady(rate, half, answers)).toBe(false);
    const full = writeRatings([
      { label: 'Wash my clothes', enjoy: 2, achieve: 8 },
      { label: 'Dance', enjoy: 9, achieve: 0 },
    ]);
    expect(isStepReady(rate, full, answers)).toBe(true);
    expect(readRatings(full)[1]).toEqual({ label: 'Dance', enjoy: 9, achieve: 0 });
  });

  it('opens the ladder only once every rung is shown', () => {
    const ladder = find('ladder');
    expect(isStepReady(ladder, 2)).toBe(false);
    expect(isStepReady(ladder, ladder.kind === 'ladder' ? ladder.rungs.length : 0)).toBe(true);
  });
});

describe('planning the week', () => {
  const planner = find('week-plan') as PlannerStep;

  it('suggests picked activities and the first small step', () => {
    const answers: Record<string, StepAnswer> = {
      pick: ['Call someone at home', 'Read for 20 minutes'],
      'own-task': ['Start my assignment', 'Write the title '],
    };
    expect(plannerSuggestions(planner, steps, answers)).toEqual([
      'Call someone at home',
      'Read for 20 minutes',
      'Write the title',
    ]);
  });

  it('round-trips a plan and needs at least one item', () => {
    const plan = writePlan([
      { date: '2026-11-12', slot: 'evening', label: 'Call Mum', predicted: 4 },
      { date: '2026-11-13', slot: 'morning', label: 'Walk' },
    ]);
    expect(readPlan(plan)).toEqual([
      { date: '2026-11-12', slot: 'evening', label: 'Call Mum', predicted: 4 },
      { date: '2026-11-13', slot: 'morning', label: 'Walk', predicted: undefined },
    ]);
    expect(isStepReady(planner, [])).toBe(false);
    expect(isStepReady(planner, plan)).toBe(true);
  });

  it('lays out the week ahead and the calendar week', () => {
    expect(nextSevenDays(wednesday).map((d) => d.getDate())).toEqual([11, 12, 13, 14, 15, 16, 17]);
    expect(weekDays(wednesday).map((d) => d.getDate())).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(weekDays(wednesday, 1)[0].getDate()).toBe(16);
    expect(dayName(wednesday, wednesday)).toBe('Today');
    expect(dayName(new Date(2026, 10, 12), wednesday)).toBe('Tomorrow');
  });

  it('shows the researcher what was planned', () => {
    const [plan] = summariseSession(SESSION_5, {
      done: ['plan'],
      answers: {
        'week-plan': writePlan([
          { date: '2026-11-12', slot: 'evening', label: 'Call Mum', predicted: 4 },
        ]),
      },
    }).filter((p) => p.id === 'plan');
    expect(plan.lines).toEqual([
      { label: 'Planned 1 activity', value: 'Call Mum (2026-11-12, evening, guessed 4/10)' },
    ]);
  });
});

describe('my week', () => {
  const item = { date: '2026-11-12', slot: 'evening' as const, label: 'Call Mum', predicted: 3 };

  it('saves a plan once, even if the part is saved twice', () => {
    const store = loadStore();
    store.addPlans([toPlanned(item, 5)]);
    store.addPlans([toPlanned(item, 5)]);
    expect(store.getPlannedActivities()).toHaveLength(1);
    expect(store.getPlannedActivities()[0].id).toBe(planId(item));
  });

  it('keeps a rating when the same plan is saved again', () => {
    const store = loadStore();
    store.addPlans([toPlanned(item)]);
    store.completeActivity(planId(item), 7, 5, wednesday);
    store.addPlans([toPlanned(item)]);
    expect(store.getPlannedActivities()[0]).toMatchObject({ enjoy: 7, achieve: 5 });
  });

  it('compares what was expected with how it felt', () => {
    expect(predictionGap([toPlanned(item)])).toBeNull();
    const done = [
      { ...toPlanned(item), doneAt: 'x', enjoy: 7, achieve: 5 },
      { ...toPlanned({ ...item, label: 'Walk', predicted: 4 }), doneAt: 'x', enjoy: 6 },
    ];
    expect(predictionGap(done)).toEqual({ count: 2, expected: 3.5, actual: 6.5 });
  });

  it('removes a plan', () => {
    const store = loadStore();
    store.addPlans([toPlanned(item)]);
    store.removeActivity(planId(item));
    expect(store.getPlannedActivities()).toEqual([]);
  });
});
