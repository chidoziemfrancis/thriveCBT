import type { SessionContent, SessionStep, StepAnswer } from './content/types';

export type SessionRecord = {
  done: string[];
  /** Each step's answer, keyed by step id. */
  answers?: Record<string, StepAnswer>;
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

/** How many multiple-choice steps were answered correctly. */
export function choiceScore(steps: SessionStep[], answers: Record<string, StepAnswer> = {}) {
  return steps.filter((s) => s.kind === 'choice' && answers[s.id] === s.answer).length;
}

/** Where a step sits in the whole session, for one progress bar across every part. */
export function stepPosition(content: SessionContent, moduleId: string, stepIndex: number) {
  const total = content.modules.reduce((sum, m) => sum + m.steps.length, 0);
  const index = content.modules.findIndex((m) => m.id === moduleId);
  const before = content.modules.slice(0, index).reduce((sum, m) => sum + m.steps.length, 0);
  return { done: before + stepIndex, total };
}

/**
 * Whether Continue is unlocked: each step asks for one small action first, except reading
 * steps and breathing, which can always be skipped.
 */
export function isStepReady(step: SessionStep, answer: StepAnswer | undefined): boolean {
  switch (step.kind) {
    case 'info':
    case 'video':
    case 'breathe':
      return true;
    case 'reveal':
      return Array.isArray(answer) && answer.length >= step.cards.length;
    case 'checklist':
      return Array.isArray(answer) && answer.length > 0;
    case 'mythFact':
      return typeof answer === 'boolean';
    case 'choice':
    case 'scale':
      return typeof answer === 'number';
    case 'journal':
      return typeof answer === 'string' && answer.trim().length > 0;
  }
}
