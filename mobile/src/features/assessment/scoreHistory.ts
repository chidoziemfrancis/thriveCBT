import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'phq9_scores';

export type Phq9Result = { score: number; at: string };

// Answers are cleared once the results are seen, so the score is kept here to compare the
// baseline with later check-ins.
export function getPhq9Scores(): Phq9Result[] {
  return readJson<Phq9Result[]>(STORAGE_KEY, []);
}

export function recordPhq9Score(score: number, now = new Date()): Phq9Result {
  const result = { score, at: now.toISOString() };
  writeJson(STORAGE_KEY, [...getPhq9Scores(), result]);
  return result;
}
