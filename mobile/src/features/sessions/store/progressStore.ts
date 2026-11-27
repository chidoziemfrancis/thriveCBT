import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';
import { queueChange, registerSyncKind } from '@/lib/sync';

import { SESSIONS_PATH, sessionPath } from '../api/sessions.service';
import type { StepAnswer } from '../content/types';
import type { SaveSessionBody, ServerSession } from '../types/session.types';
import type { SessionRecord } from '../utils/sessionLogic';

const STORAGE_KEY = 'session_progress';

type Progress = Record<number, SessionRecord>;

let progress: Progress = readJson<Progress>(STORAGE_KEY, {});
const listeners = new Set<() => void>();

function commit(next: Progress) {
  progress = next;
  writeJson(STORAGE_KEY, progress);
  listeners.forEach((listener) => listener());
}

function toServer(record: SessionRecord, updatedAt: string): SaveSessionBody {
  return {
    done: record.done,
    answers: record.answers ?? {},
    completedAt: record.completedAt ?? null,
    updatedAt,
  };
}

function send(sessionId: number, record: SessionRecord, updatedAt: string) {
  queueChange({
    key: `sessions:${sessionId}`,
    kind: 'sessions',
    method: 'PUT',
    path: sessionPath(sessionId),
    body: toServer(record, updatedAt),
  });
}

// Saved on the phone first, so it works offline, then sent; the sync engine retries until the
// server has it.
function update(sessionId: number, patch: (record: SessionRecord) => SessionRecord) {
  const current = progress[sessionId] ?? { done: [] };
  const next = patch(current);
  if (next === current) return;
  const updatedAt = new Date().toISOString();
  commit({ ...progress, [sessionId]: { ...next, updatedAt } });
  send(sessionId, next, updatedAt);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Live progress, so Home and the Sessions tab update as soon as a part is finished. */
export function useSessionProgress(): Progress {
  return useSyncExternalStore(subscribe, () => progress);
}

export function completeModule(sessionId: number, moduleId: string) {
  update(sessionId, (r) => (r.done.includes(moduleId) ? r : { ...r, done: [...r.done, moduleId] }));
}

export function saveAnswer(sessionId: number, stepId: string, answer: StepAnswer) {
  update(sessionId, (r) => ({ ...r, answers: { ...r.answers, [stepId]: answer } }));
}

export function completeSession(sessionId: number, now = new Date()) {
  update(sessionId, (r) => (r.completedAt ? r : { ...r, completedAt: now.toISOString() }));
}

const isNewer = (a: string | undefined, b: string | undefined) => !b || (a !== undefined && a >= b);

/** Takes the server's records where they're newer than the phone's. */
export function applyServerSessions(items: ServerSession[]) {
  let next = progress;
  for (const item of items) {
    const local = next[item.sessionId];
    if (local && !isNewer(item.updatedAt, local.updatedAt)) continue;
    next = {
      ...next,
      [item.sessionId]: {
        done: item.done,
        answers: item.answers,
        ...(item.completedAt ? { completedAt: item.completedAt } : {}),
        updatedAt: item.updatedAt,
      },
    };
  }
  if (next !== progress) commit(next);
}

/** Sends progress saved before sync existed, unless the server already has that session. */
export function uploadLocalSessions(serverItems: ServerSession[]) {
  const onServer = new Set(serverItems.map((item) => item.sessionId));
  const now = new Date().toISOString();
  for (const [id, record] of Object.entries(progress)) {
    const sessionId = Number(id);
    if (onServer.has(sessionId)) continue;
    send(sessionId, record, record.updatedAt ?? now);
  }
}

export function clearLocalSessions() {
  commit({});
}

registerSyncKind<ServerSession>({
  name: 'sessions',
  path: SESSIONS_PATH,
  applyServerItems: applyServerSessions,
  uploadLocal: uploadLocalSessions,
  clearLocal: clearLocalSessions,
});
