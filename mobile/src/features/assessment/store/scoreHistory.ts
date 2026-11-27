import { readJson, writeJson } from '@/lib/storage';

import type { ServerPhq9 } from '../types/assessment.types';

const STORAGE_KEY = 'phq9_scores';

/** `final` marks the week-8 check-in; the first result without it is the baseline. */
export type Phq9Result = { score: number; at: string; kind?: 'final' };

function fromServer(result: ServerPhq9): Phq9Result {
  return result.kind === 'final'
    ? { score: result.score, at: result.takenAt, kind: 'final' }
    : { score: result.score, at: result.takenAt };
}

// The phone's copy of the scores, written only from the server's answers, so screens can
// compare the baseline with week 8 offline.
export function getPhq9Scores(): Phq9Result[] {
  return readJson<Phq9Result[]>(STORAGE_KEY, []);
}

/** Replaces the copy with the server's list, e.g. after signing in on a new phone. */
export function savePhq9ScoresOnPhone(results: ServerPhq9[]) {
  writeJson(STORAGE_KEY, results.map(fromServer));
}

/** Adds or replaces one result; each kind is only ever saved once. */
export function savePhq9OnPhone(result: ServerPhq9) {
  const saved = fromServer(result);
  const others = getPhq9Scores().filter((r) => (r.kind ?? 'baseline') !== result.kind);
  writeJson(STORAGE_KEY, result.kind === 'final' ? [...others, saved] : [saved, ...others]);
}

export function getBaselinePhq9(): Phq9Result | undefined {
  return getPhq9Scores().find((r) => r.kind !== 'final');
}

export function getFinalPhq9(): Phq9Result | undefined {
  return getPhq9Scores().find((r) => r.kind === 'final');
}
