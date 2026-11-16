import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { countIn, practiceDays, type PracticeData } from '@/features/homework/homework';
import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_8 } from '@/features/sessions/content/session8';
import { isStepReady } from '@/features/sessions/sessionLogic';
import {
  journeyLines,
  readGoal,
  wellPlanFrom,
  writeGoal,
  type JourneyData,
} from '@/features/wellbeing/wellbeing';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

function load<T>(path: string): T {
  let mod!: T;
  jest.isolateModules(() => {
    mod = require(path);
  });
  return mod;
}

beforeEach(() => mockMemory.clear());

const steps = SESSION_8.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;
const goal = {
  area: 'Studies',
  goal: 'Pass all my courses',
  steps: ['Make a timetable'],
  date: '2026-11-18',
};

describe('session 8 content', () => {
  it('is registered as the finale with its four parts and unique step ids', () => {
    expect(sessionContent(8)).toBe(SESSION_8);
    expect(SESSION_8.finale).toBe(true);
    expect(SESSION_8.modules.map((m) => m.id)).toEqual(['journey', 'signs', 'ahead', 'note']);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('your eight weeks', () => {
  const empty: JourneyData = {
    moods: [],
    thoughts: [],
    plans: [],
    toolkit: [],
    stress: [],
    evidence: [],
  };

  it('has a line for every week, even with nothing logged', () => {
    const lines = journeyLines(empty);
    expect(lines).toHaveLength(8);
    expect(lines.every((l) => l.line.length > 0)).toBe(true);
  });

  it('uses the student’s own numbers', () => {
    const lines = journeyLines({
      ...empty,
      thoughts: [
        {
          id: 'a',
          at: '2026-10-01T10:00:00Z',
          situation: '',
          feeling: [],
          thought: 'x',
          traps: ['mind-reading'],
        },
        {
          id: 'b',
          at: '2026-10-02T10:00:00Z',
          situation: '',
          feeling: [],
          thought: 'y',
          traps: ['mind-reading'],
          balanced: 'z',
        },
      ],
      plans: [
        { id: 'p', date: '2026-10-05', slot: 'morning', label: 'Walk', doneAt: 'x' },
        { id: 'q', date: '2026-10-06', slot: 'evening', label: 'Call Mum' },
      ],
      newBelief: 'I’m still learning',
    });
    expect(lines[2].line).toBe('You caught 2 thoughts. Most common trap: mind reading.');
    expect(lines[3].line).toBe('You challenged 1 thought with the evidence.');
    expect(lines[4].line).toBe('You did 1 of 2 planned activities.');
    expect(lines[6].line).toBe('Your new belief: “I’m still learning”.');
  });
});

describe('the staying-well plan', () => {
  it('needs an area, a goal, a step and a date', () => {
    const step = find('my-goal');
    expect(isStepReady(step, writeGoal({ ...goal, date: '' }))).toBe(false);
    expect(isStepReady(step, writeGoal(goal))).toBe(true);
    expect(readGoal(writeGoal(goal))).toEqual(goal);
  });

  it('collects the lists, the goal and the note', () => {
    expect(wellPlanFrom({})).toBeNull();
    expect(
      wellPlanFrom({
        'well-triggers': ['Exam season'],
        'well-people': ['Ada', ' '],
        'hard-day-note': ' You’ve got this. ',
        'my-goal': writeGoal(goal),
      })
    ).toEqual({ triggers: ['Exam season'], people: ['Ada'], note: 'You’ve got this.', goal });
  });

  it('keeps ticked goal steps when the plan is saved again', () => {
    const store = load<typeof import('@/features/wellbeing/wellPlanStore')>(
      '@/features/wellbeing/wellPlanStore'
    );
    store.saveWellPlan({ goal });
    store.toggleGoalStep(0);
    store.saveWellPlan({ goal, note: 'Hi' });
    expect(store.getWellPlan()?.goal?.done).toEqual([0]);
  });

  it('shows the researcher the lists and the goal', () => {
    const ahead = summariseSession(SESSION_8, {
      done: ['ahead'],
      answers: { 'my-goal': writeGoal(goal) },
    }).find((p) => p.id === 'ahead')!;
    expect(ahead.lines).toEqual([
      { label: 'Goal · Studies', value: 'Pass all my courses' },
      { label: 'Steps', value: 'Make a timetable' },
      { label: 'First step on', value: '2026-11-18' },
    ]);
  });
});

describe('homework tracker', () => {
  const data: PracticeData = {
    moods: [{ mood: 3, at: new Date(2026, 10, 16, 9).toISOString() }],
    thoughts: [
      {
        id: 't',
        at: new Date(2026, 10, 17, 9).toISOString(),
        situation: '',
        feeling: [],
        thought: 'x',
        traps: [],
        balanced: 'y',
      },
    ],
    plans: [],
    uses: [],
    stress: [],
    evidence: [],
    ticks: { 8: ['2026-11-18'] },
  };

  it('ticks days from what the student did, and from hand ticks', () => {
    expect([...practiceDays(1, data)]).toEqual(['2026-11-16']);
    expect([...practiceDays(2, data)].sort()).toEqual(['2026-11-16', '2026-11-17']);
    expect([...practiceDays(4, data)]).toEqual(['2026-11-17']);
    expect([...practiceDays(8, data)]).toEqual(['2026-11-18']);
  });

  it('counts the days done in a week', () => {
    const week = [16, 17, 18, 19, 20, 21, 22].map((d) => new Date(2026, 10, d));
    expect(countIn(practiceDays(2, data), week)).toBe(2);
  });

  it('toggles a hand tick', () => {
    const store = load<typeof import('@/features/homework/homeworkStore')>(
      '@/features/homework/homeworkStore'
    );
    store.toggleTick(8, '2026-11-18');
    expect(store.getHomeworkTicks()[8]).toEqual(['2026-11-18']);
    store.toggleTick(8, '2026-11-18');
    expect(store.getHomeworkTicks()[8]).toEqual([]);
  });
});
