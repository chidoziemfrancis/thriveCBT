import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';
import { isUuid, mergeServerItems, notOnServer, queueChange, registerSyncKind } from '@/lib/sync';

import { PLANNED_ACTIVITIES_PATH, plannedActivityPath } from '../api/activities.service';
import type { SavePlannedActivityBody, ServerPlannedActivity } from '../types/activities.types';
import { type PlannedActivity, planId } from '../utils/activities';

const STORAGE_KEY = 'planned_activities';

let plans: PlannedActivity[] = load();
const listeners = new Set<() => void>();

// Plans saved before sync had ids like `plan-2026-11-28-morning-take-a-walk`; they get the same
// content-based UUID a new plan for that day, slot and activity would get.
function load(): PlannedActivity[] {
  const saved = readJson<PlannedActivity[]>(STORAGE_KEY, []);
  if (saved.every((plan) => isUuid(plan.id))) return saved;
  const fixed = saved.map((plan) => (isUuid(plan.id) ? plan : { ...plan, id: planId(plan) }));
  writeJson(STORAGE_KEY, fixed);
  return fixed;
}

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

function toServer(plan: PlannedActivity): SavePlannedActivityBody {
  return {
    date: plan.date,
    slot: plan.slot,
    label: plan.label,
    predicted: plan.predicted ?? null,
    sessionId: plan.sessionId ?? null,
    doneAt: plan.doneAt ?? null,
    enjoy: plan.enjoy ?? null,
    achieve: plan.achieve ?? null,
    updatedAt: plan.updatedAt ?? new Date().toISOString(),
  };
}

// Saved on the phone first, so it works offline; the sync engine sends the whole plan each time,
// so a rating made later is never lost to an older copy.
function send(plan: PlannedActivity) {
  queueChange({
    key: `planned-activities:${plan.id}`,
    kind: 'planned-activities',
    method: 'PUT',
    path: plannedActivityPath(plan.id),
    body: toServer(plan),
  });
}

/** Adds new plans and leaves ones already saved (and any ratings on them) alone. */
export function addPlans(items: PlannedActivity[]) {
  const updatedAt = new Date().toISOString();
  const fresh = items
    .filter((item) => !plans.some((p) => p.id === item.id))
    .map((item) => ({ ...item, updatedAt }));
  if (fresh.length === 0) return;
  save([...plans, ...fresh]);
  fresh.forEach(send);
}

export function completeActivity(id: string, enjoy: number, achieve: number, now = new Date()) {
  const plan = plans.find((p) => p.id === id);
  if (!plan) return;
  const done: PlannedActivity = {
    ...plan,
    doneAt: now.toISOString(),
    enjoy,
    achieve,
    updatedAt: new Date().toISOString(),
  };
  save(plans.map((p) => (p.id === id ? done : p)));
  send(done);
}

export function removeActivity(id: string) {
  save(plans.filter((p) => p.id !== id));
  queueChange({
    key: `planned-activities:${id}`,
    kind: 'planned-activities',
    method: 'DELETE',
    path: plannedActivityPath(id),
  });
}

function fromServer(item: ServerPlannedActivity): PlannedActivity {
  return {
    id: item.id,
    date: item.date,
    slot: item.slot,
    label: item.label,
    ...(item.predicted !== null ? { predicted: item.predicted } : {}),
    ...(item.sessionId !== null ? { sessionId: item.sessionId } : {}),
    ...(item.doneAt ? { doneAt: item.doneAt } : {}),
    ...(item.enjoy !== null ? { enjoy: item.enjoy } : {}),
    ...(item.achieve !== null ? { achieve: item.achieve } : {}),
    updatedAt: item.updatedAt,
  };
}

export function applyServerPlans(items: ServerPlannedActivity[]) {
  save(mergeServerItems(plans, items, fromServer));
}

export function uploadLocalPlans(serverItems: ServerPlannedActivity[]) {
  notOnServer(plans, serverItems).forEach(send);
}

export function clearLocalPlans() {
  save([]);
}

registerSyncKind<ServerPlannedActivity>({
  name: 'planned-activities',
  path: PLANNED_ACTIVITIES_PATH,
  applyServerItems: applyServerPlans,
  uploadLocal: uploadLocalPlans,
  clearLocal: clearLocalPlans,
});
