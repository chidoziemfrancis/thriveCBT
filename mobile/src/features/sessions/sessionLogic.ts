import type { QuizQuestion, SessionContent } from './content/types';

export type SessionRecord = {
  done: string[];
  ratings?: Record<string, number>;
  quizAnswers?: Record<string, number>;
  completedAt?: string;
};

export type SessionStatus = 'done' | 'current' | 'available' | 'locked';

/** A new session unlocks each study week; earlier ones stay open to revisit. */
export function sessionStatus(
  sessionId: number,
  week: number,
  record: SessionRecord | undefined
): SessionStatus {
  if (record?.completedAt) return 'done';
  if (sessionId > week) return 'locked';
  if (sessionId === week) return 'current';
  return 'available';
}

export function nextModuleId(content: SessionContent, record: SessionRecord | undefined) {
  return content.modules.find((m) => !record?.done.includes(m.id))?.id ?? null;
}

export function modulesDone(content: SessionContent, record: SessionRecord | undefined) {
  return content.modules.filter((m) => record?.done.includes(m.id)).length;
}

export function quizScore(questions: QuizQuestion[], answers: Record<string, number>) {
  return questions.filter((q) => answers[q.id] === q.answer).length;
}
