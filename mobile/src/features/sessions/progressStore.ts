import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import type { StepAnswer } from './content/types';
import type { SessionRecord } from './sessionLogic';

const STORAGE_KEY = 'session_progress';

type Progress = Record<number, SessionRecord>;

let progress: Progress = readJson<Progress>(STORAGE_KEY, {});
const listeners = new Set<() => void>();

function update(sessionId: number, patch: (record: SessionRecord) => SessionRecord) {
  const current = progress[sessionId] ?? { done: [] };
  progress = { ...progress, [sessionId]: patch(current) };
  writeJson(STORAGE_KEY, progress);
  listeners.forEach((listener) => listener());
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

export function saveRatings(sessionId: number, ratings: Record<string, number>) {
  update(sessionId, (r) => ({ ...r, ratings }));
}

export function saveQuizAnswers(sessionId: number, quizAnswers: Record<string, number>) {
  update(sessionId, (r) => ({ ...r, quizAnswers }));
}

export function saveAnswer(sessionId: number, stepId: string, answer: StepAnswer) {
  update(sessionId, (r) => ({
    ...r,
    answers: { ...r.answers, [stepId]: answer },
  }));
}

export function completeSession(sessionId: number, now = new Date()) {
  update(sessionId, (r) => (r.completedAt ? r : { ...r, completedAt: now.toISOString() }));
}
