import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import type { PlannedActivity } from './activities';

const STORAGE_KEY = 'planned_activities';

let plans: PlannedActivity[] = readJson<PlannedActivity[]>(STORAGE_KEY, []);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function save(next: PlannedActivity[]) {
  plans = next;
  writeJson(STORAGE_KEY, plans);
  listeners.forEach((listener) => listener());
}

export function usePlannedActivities(): PlannedActivity[] {
  return useSyncExternalStore(subscribe, () => plans);
}

export function getPlannedActivities() {
  return plans;
}

/** Adds new plans and leaves ones already saved (and any ratings on them) alone. */
export function addPlans(items: PlannedActivity[]) {
  const fresh = items.filter((item) => !plans.some((p) => p.id === item.id));
  if (fresh.length > 0) save([...plans, ...fresh]);
}

export function completeActivity(id: string, enjoy: number, achieve: number, now = new Date()) {
  save(plans.map((p) => (p.id === id ? { ...p, doneAt: now.toISOString(), enjoy, achieve } : p)));
}

export function removeActivity(id: string) {
  save(plans.filter((p) => p.id !== id));
}
