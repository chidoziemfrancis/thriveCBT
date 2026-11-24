import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'phq9_scores';

/** `final` marks the week-8 check-in; the first result without it is the baseline. */
export type Phq9Result = { score: number; at: string; kind?: 'final' };

// Answers are cleared once the results are seen, so the score is kept here to compare the
// baseline with later check-ins.
export function getPhq9Scores(): Phq9Result[] {
  return readJson<Phq9Result[]>(STORAGE_KEY, []);
}

export function recordPhq9Score(
  score: number,
  now = new Date(),
  kind?: Phq9Result['kind']
): Phq9Result {
  const result: Phq9Result = kind
    ? { score, at: now.toISOString(), kind }
    : { score, at: now.toISOString() };
  writeJson(STORAGE_KEY, [...getPhq9Scores(), result]);
  return result;
}

export function getBaselinePhq9(): Phq9Result | undefined {
  return getPhq9Scores().find((r) => r.kind !== 'final');
}

export function getFinalPhq9(): Phq9Result | undefined {
  return getPhq9Scores().find((r) => r.kind === 'final');
}

/** Saves the week-8 score once; running it again keeps the first result. */
export function recordFinalPhq9(score: number, now = new Date()): Phq9Result {
  return getFinalPhq9() ?? recordPhq9Score(score, now, 'final');
}
