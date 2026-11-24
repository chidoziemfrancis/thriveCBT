import { readJson, removeKey, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'phq9_answers';
const MODE_KEY = 'phq9_mode';

/** The PHQ-9 is taken twice: at sign-up, and once more at the end of week 8. */
export type Phq9Mode = 'baseline' | 'final';

export function getAnswers(): number[] {
  return readJson<number[]>(STORAGE_KEY, []);
}

export function setAnswer(index: number, value: number) {
  const answers = getAnswers();
  answers[index] = value;
  writeJson(STORAGE_KEY, answers);
}

export function clearAnswers() {
  removeKey(STORAGE_KEY);
  removeKey(MODE_KEY);
}

export function getPhq9Mode(): Phq9Mode {
  return readJson<Phq9Mode>(MODE_KEY, 'baseline');
}

/** Starts a fresh questionnaire in the given mode, so old answers never carry over. */
export function startPhq9(mode: Phq9Mode) {
  removeKey(STORAGE_KEY);
  writeJson(MODE_KEY, mode);
}
