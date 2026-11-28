import { readJson, removeKey, writeJson } from '@/lib/storage';
import { onStudentChange } from '@/lib/sync';

import type { ServerEpqr } from '../types/assessment.types';

const ANSWERS_KEY = 'epqr_answers';
const RESULT_KEY = 'epqr_result';

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

export function clearEpqrAnswers() {
  removeKey(ANSWERS_KEY);
}

// Scores stay on the server for the researcher; the phone only keeps that it was saved.
export function getEpqrResult(): ServerEpqr | null {
  const saved = readJson<ServerEpqr | null>(RESULT_KEY, null);
  return saved && 'needsSupport' in saved ? saved : null;
}

export function saveEpqrOnPhone(result: ServerEpqr) {
  writeJson(RESULT_KEY, result);
}

// Answers in progress, and whether this student already sent theirs, belong to one student.
onStudentChange(() => {
  removeKey(ANSWERS_KEY);
  removeKey(RESULT_KEY);
});
