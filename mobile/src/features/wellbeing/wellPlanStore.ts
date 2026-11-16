import { createStore } from '@/lib/createStore';

import type { WellPlan } from './wellbeing';

const plan = createStore<WellPlan | null>('wellbeing_plan', null);

export const useWellPlan = plan.use;
export const getWellPlan = plan.get;

/** Saves the plan, keeping goal steps already ticked off if the goal is unchanged. */
export function saveWellPlan(next: WellPlan) {
  const done = plan.get()?.goal?.goal === next.goal?.goal ? plan.get()?.goal?.done : undefined;
  plan.set(next.goal && done ? { ...next, goal: { ...next.goal, done } } : next);
}

export function toggleGoalStep(index: number) {
  const current = plan.get();
  if (!current?.goal) return;
  const done = current.goal.done ?? [];
  plan.set({
    ...current,
    goal: {
      ...current.goal,
      done: done.includes(index) ? done.filter((i) => i !== index) : [...done, index],
    },
  });
}
