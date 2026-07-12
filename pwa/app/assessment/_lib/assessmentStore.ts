const STORAGE_KEY = "phq9_answers";

export function getAnswers(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function setAnswer(index: number, value: number) {
  const answers = getAnswers();
  answers[index] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function clearAnswers() {
  localStorage.removeItem(STORAGE_KEY);
}
