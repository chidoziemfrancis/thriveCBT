import type { PlannedActivity } from '@/features/activities/activities';
import type { PositiveEntry } from '@/features/beliefs/beliefs';
import type { StressEntry } from '@/features/coping/copingStore';
import type { MoodEntry } from '@/features/mood/utils/moodLog';
import type { StepAnswer } from '@/features/sessions/content/types';
import { SESSIONS } from '@/features/sessions/constants/sessions';
import { TRAPS } from '@/features/sessions/constants/traps';
import type { ThoughtRecord } from '@/features/thoughts/thoughtLog';

/** The skills from the eight weeks, for picking the ones that helped most. */
export const SKILLS = [
  'Tracking my mood',
  'Spotting thinking traps',
  'Challenging unhelpful thoughts',
  'Planning small activities',
  'Breathing and relaxing',
  'My coping toolkit',
  'Being kind to myself',
  'Talking to someone',
];

export type WellSection = 'triggers' | 'signs' | 'actions' | 'people';

export const WELL_SECTIONS: { id: WellSection; title: string }[] = [
  { id: 'triggers', title: 'My triggers' },
  { id: 'signs', title: 'My early warning signs' },
  { id: 'actions', title: 'What I’ll do' },
  { id: 'people', title: 'Who I’ll tell' },
];

export const GOAL_AREAS = ['Studies', 'Friendships', 'Health', 'Faith', 'Family', 'Money and work'];

export type Goal = { area: string; goal: string; steps: string[]; date: string; done?: number[] };

const AREA = 'area:';
const GOAL = 'goal:';
const STEP = 'step:';
const DATE = 'date:';

export function readGoal(answer: unknown): Goal {
  const items = Array.isArray(answer) ? (answer as string[]) : [];
  const one = (prefix: string) =>
    items.find((i) => i.startsWith(prefix))?.slice(prefix.length) ?? '';
  return {
    area: one(AREA),
    goal: one(GOAL),
    steps: items.filter((i) => i.startsWith(STEP)).map((i) => i.slice(STEP.length)),
    date: one(DATE),
  };
}

export function writeGoal(goal: Goal): string[] {
  return [
    ...(goal.area ? [AREA + goal.area] : []),
    ...(goal.goal ? [GOAL + goal.goal] : []),
    ...goal.steps.map((s) => STEP + s),
    ...(goal.date ? [DATE + goal.date] : []),
  ];
}

export function goalReady(goal: Goal) {
  return Boolean(goal.area && goal.goal.trim() && goal.steps.length > 0 && goal.date);
}

export type WellPlan = Partial<Record<WellSection, string[]>> & { note?: string; goal?: Goal };

/** Where Session 8 keeps each part of the plan. */
export const WELL_IDS = {
  triggers: 'well-triggers',
  signs: 'well-signs',
  actions: 'well-actions',
  people: 'well-people',
  note: 'hard-day-note',
  goal: 'my-goal',
} as const;

/** The staying-well plan from Session 8's answers, or null if nothing was written. */
export function wellPlanFrom(answers: Record<string, StepAnswer>): WellPlan | null {
  const plan: WellPlan = {};
  for (const { id } of WELL_SECTIONS) {
    const value = answers[WELL_IDS[id]];
    const items = Array.isArray(value)
      ? (value as string[]).map((i) => i.trim()).filter(Boolean)
      : [];
    if (items.length) plan[id] = items;
  }
  const note = answers[WELL_IDS.note];
  if (typeof note === 'string' && note.trim()) plan.note = note.trim();
  const goal = readGoal(answers[WELL_IDS.goal]);
  if (goalReady(goal)) plan.goal = goal;
  return Object.keys(plan).length > 0 ? plan : null;
}

export type JourneyData = {
  moods: MoodEntry[];
  thoughts: ThoughtRecord[];
  plans: PlannedActivity[];
  toolkit: string[];
  stress: StressEntry[];
  evidence: PositiveEntry[];
  newBelief?: string;
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** One line per week, told with the student's own numbers where there are any. */
export function journeyLines(data: JourneyData) {
  const challenged = data.thoughts.filter((t) => t.balanced).length;
  const done = data.plans.filter((p) => p.doneAt).length;
  // Over the whole study, not just this week.
  const trap = TRAPS.map((t) => ({
    ...t,
    count: data.thoughts.filter((r) => r.traps.includes(t.id)).length,
  }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)[0];
  const lines: Record<number, string> = {
    1: data.moods.length
      ? `You logged your mood on ${plural(data.moods.length, 'day')}.`
      : 'You learned how low mood shows up in thoughts, feelings, body and actions.',
    2: 'You saw how thoughts, feelings and actions feed each other.',
    3: data.thoughts.length
      ? `You caught ${plural(data.thoughts.length, 'thought')}.${trap ? ` Most common trap: ${trap.label.toLowerCase()}.` : ''}`
      : 'You learned to spot thinking traps.',
    4: challenged
      ? `You challenged ${plural(challenged, 'thought')} with the evidence.`
      : 'You learned to weigh the evidence and find a balanced thought.',
    5: data.plans.length
      ? `You did ${done} of ${plural(data.plans.length, 'planned activity', 'planned activities')}.`
      : 'You learned that action comes first, and motivation follows.',
    6: data.toolkit.length
      ? `${plural(data.toolkit.length, 'tool')} in your toolkit${data.stress.length ? ` · ${plural(data.stress.length, 'stressful moment')} logged` : ''}.`
      : 'You learned to notice stress early and calm your body.',
    7: data.newBelief
      ? `Your new belief: “${data.newBelief}”${data.evidence.length ? ` · ${plural(data.evidence.length, 'piece')} of evidence` : ''}.`
      : 'You looked at the beliefs under your thoughts.',
    8: 'And now, a plan to keep it going.',
  };
  return SESSIONS.map((s) => ({ week: s.id, title: s.title, line: lines[s.id] }));
}
