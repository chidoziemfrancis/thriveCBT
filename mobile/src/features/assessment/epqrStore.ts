import { readJson, removeKey, writeJson } from '@/lib/storage';

import { WISHED_DEAD_INDEX, epqrScores, type EpqrScale } from './epqr';

const ANSWERS_KEY = 'epqr_answers';
const RESULT_KEY = 'epqr_result';

export type EpqrResult = {
  answers: boolean[];
  scores: Record<EpqrScale, number>;
  /** Yes to "Have you ever wished that you were dead?" */
  wishedDead: boolean;
  at: string;
};

/** Answers so far, kept as they're given so a closed app can pick up where it stopped. */
export function getEpqrAnswers(): (boolean | undefined)[] {
  return readJson<(boolean | null)[]>(ANSWERS_KEY, []).map((a) => a ?? undefined);
}

export function setEpqrAnswer(index: number, value: boolean) {
  const answers = readJson<(boolean | null)[]>(ANSWERS_KEY, []);
  answers[index] = value;
  writeJson(
    ANSWERS_KEY,
    Array.from(answers, (a) => a ?? null)
  );
}

export function getEpqrResult(): EpqrResult | null {
  return readJson<EpqrResult | null>(RESULT_KEY, null);
}

/** Scores the finished questionnaire, keeps the result and clears the answers in progress. */
export function finishEpqr(now = new Date()): EpqrResult {
  const answers = getEpqrAnswers().map((a) => a === true);
  const result: EpqrResult = {
    answers,
    scores: epqrScores(answers),
    wishedDead: answers[WISHED_DEAD_INDEX],
    at: now.toISOString(),
  };
  writeJson(RESULT_KEY, result);
  removeKey(ANSWERS_KEY);
  return result;
}
