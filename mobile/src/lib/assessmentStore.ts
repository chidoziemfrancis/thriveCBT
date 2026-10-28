import { readJson, removeKey, writeJson } from './storage';

const STORAGE_KEY = 'phq9_answers';

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
}
