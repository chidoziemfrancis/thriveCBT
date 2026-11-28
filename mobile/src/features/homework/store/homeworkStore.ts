import { dayKey } from '@/features/activities/utils/activities';
import { createStore } from '@/lib/createStore';
import { readJson, removeKey, writeJson } from '@/lib/storage';
import { contentUuid, queueChange, registerSyncKind } from '@/lib/sync';

import { HOMEWORK_TICKS_PATH, homeworkTickPath } from '../api/homework.service';
import type { ServerHomeworkTick } from '../types/homework.types';

/** Days ticked off by hand, per session: `{ 3: ['2026-11-28'] }`. */
type Ticks = Record<string, string[]>;
/** When each tick was last made or removed on this phone, so a pull never undoes a newer change. */
type TickChanges = Record<string, string>;

const ticks = createStore<Ticks>('homework_ticks', {});
const CHANGES_KEY = 'homework_tick_changes';

export const useHomeworkTicks = ticks.use;
export const getHomeworkTicks = ticks.get;

/** A tick's id comes from its session and day, so the same tick is one item on every phone. */
export const homeworkTickId = (sessionId: number, day: string) =>
  contentUuid(`homework|${sessionId}|${day}`);

function noteChange(id: string, updatedAt: string) {
  writeJson(CHANGES_KEY, { ...readJson<TickChanges>(CHANGES_KEY, {}), [id]: updatedAt });
}

function sendTick(sessionId: number, day: string, updatedAt: string) {
  const id = homeworkTickId(sessionId, day);
  queueChange({
    key: `homework-ticks:${id}`,
    kind: 'homework-ticks',
    method: 'PUT',
    path: homeworkTickPath(id),
    body: { sessionId, date: day, updatedAt },
  });
}

/** Marks or unmarks a day's practice by hand. Saved on the phone first, then sent. */
export function toggleTick(sessionId: number, day = dayKey(new Date())) {
  const all = ticks.get();
  const current = all[sessionId] ?? [];
  const ticking = !current.includes(day);
  ticks.set({
    ...all,
    [sessionId]: ticking ? [...current, day] : current.filter((d) => d !== day),
  });
  const id = homeworkTickId(sessionId, day);
  const updatedAt = new Date().toISOString();
  noteChange(id, updatedAt);
  if (ticking) sendTick(sessionId, day, updatedAt);
  else
    queueChange({
      key: `homework-ticks:${id}`,
      kind: 'homework-ticks',
      method: 'DELETE',
      path: homeworkTickPath(id),
    });
}

export function applyServerHomeworkTicks(items: ServerHomeworkTick[]) {
  const changes = readJson<TickChanges>(CHANGES_KEY, {});
  const next: Ticks = { ...ticks.get() };
  for (const item of items) {
    const mine = changes[item.id];
    if (mine && mine > item.updatedAt) continue;
    const days = next[item.sessionId] ?? [];
    next[item.sessionId] = item.deletedAt
      ? days.filter((d) => d !== item.date)
      : days.includes(item.date)
        ? days
        : [...days, item.date].sort();
    changes[item.id] = item.updatedAt;
  }
  writeJson(CHANGES_KEY, changes);
  ticks.set(next);
}

/** Sends ticks made before sync existed, unless the server already has them. */
export function uploadLocalHomeworkTicks(serverItems: ServerHomeworkTick[]) {
  const onServer = new Set(serverItems.map((item) => item.id));
  const updatedAt = new Date().toISOString();
  for (const [session, days] of Object.entries(ticks.get())) {
    for (const day of days) {
      const sessionId = Number(session);
      if (!onServer.has(homeworkTickId(sessionId, day))) sendTick(sessionId, day, updatedAt);
    }
  }
}

registerSyncKind<ServerHomeworkTick>({
  name: 'homework-ticks',
  path: HOMEWORK_TICKS_PATH,
  applyServerItems: applyServerHomeworkTicks,
  uploadLocal: uploadLocalHomeworkTicks,
  clearLocal: () => {
    ticks.set({});
    removeKey(CHANGES_KEY);
  },
});
