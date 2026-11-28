import { createStore } from '@/lib/createStore';
import { readJson, removeKey, writeJson } from '@/lib/storage';
import { queueChange, registerSyncKind } from '@/lib/sync';

import { WELL_PLAN_PATH } from '../api/wellbeing.service';
import type { ServerWellPlan } from '../types/wellbeing.types';
import type { WellPlan } from '../utils/wellbeing';

const plan = createStore<WellPlan | null>('wellbeing_plan', null);
/** When this phone last changed the plan; the newest change wins when syncing. */
const UPDATED_KEY = 'wellbeing_plan_updated_at';

export const useWellPlan = plan.use;
export const getWellPlan = plan.get;

// Saved on the phone first, so it works offline; the whole plan is sent each time.
function setAndSend(next: WellPlan, updatedAt = new Date().toISOString()) {
  plan.set(next);
  writeJson(UPDATED_KEY, updatedAt);
  queueChange({
    key: 'well-plan',
    kind: 'well-plan',
    method: 'PUT',
    path: WELL_PLAN_PATH,
    body: { ...next, updatedAt },
  });
}

/** Saves the plan, keeping goal steps already ticked off if the goal is unchanged. */
export function saveWellPlan(next: WellPlan) {
  const done = plan.get()?.goal?.goal === next.goal?.goal ? plan.get()?.goal?.done : undefined;
  setAndSend(next.goal && done ? { ...next, goal: { ...next.goal, done } } : next);
}

export function toggleGoalStep(index: number) {
  const current = plan.get();
  if (!current?.goal) return;
  const done = current.goal.done ?? [];
  setAndSend({
    ...current,
    goal: {
      ...current.goal,
      done: done.includes(index) ? done.filter((i) => i !== index) : [...done, index],
    },
  });
}

/** Takes the server's plan when it's at least as new as the phone's. */
export function applyServerWellPlan([item]: ServerWellPlan[]) {
  if (!item) return;
  const mine = readJson<string | null>(UPDATED_KEY, null);
  if (mine && mine > item.updatedAt) return;
  const { updatedAt, deletedAt: _deleted, ...content } = item;
  plan.set(content);
  writeJson(UPDATED_KEY, updatedAt);
}

/** Sends a plan made before sync existed, if the server has none. */
export function uploadLocalWellPlan(serverItems: ServerWellPlan[]) {
  const current = plan.get();
  if (serverItems.length === 0 && current) {
    setAndSend(current, readJson<string | null>(UPDATED_KEY, null) ?? undefined);
  }
}

registerSyncKind<ServerWellPlan>({
  name: 'well-plan',
  path: WELL_PLAN_PATH,
  applyServerItems: applyServerWellPlan,
  uploadLocal: uploadLocalWellPlan,
  clearLocal: () => {
    plan.set(null);
    removeKey(UPDATED_KEY);
  },
});
