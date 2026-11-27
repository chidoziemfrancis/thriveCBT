import type { Phq9Result } from '@/features/assessment';
import { type PracticeData, practiceDays } from '@/features/homework/homework';
import type { SessionRecord } from '@/features/sessions/utils/sessionLogic';
import { SESSIONS } from '@/features/sessions/constants/sessions';

/** The usual line for a real change on the PHQ-9. Smaller moves count as "about the same". */
export const REAL_CHANGE = 5;
/** From "Moderately severe" up, support is offered next to the result. */
export const SUPPORT_FROM = 15;

export type Phq9Outcome = 'lighter' | 'same' | 'heavier';

export function phq9Outcome(start: number, end: number): Phq9Outcome {
  if (start - end >= REAL_CHANGE) return 'lighter';
  if (end - start >= REAL_CHANGE) return 'heavier';
  return 'same';
}

/** Support goes at the top when things got worse, or the final score is high whatever the change. */
export function needsSupport(start: number, end: number) {
  return phq9Outcome(start, end) === 'heavier' || end >= SUPPORT_FROM;
}

export const OUTCOME_COPY: Record<Phq9Outcome, { title: string; body: string }> = {
  lighter: {
    title: 'Things look lighter than when you started',
    body: 'You did the work. Keep using the skills, and your staying-well plan is here whenever you need it.',
  },
  same: {
    title: 'About the same as when you started',
    body: 'Change can take time, and the skills keep working after the programme. Your staying-well plan is here whenever you need it.',
  },
  heavier: {
    title: 'Things feel heavier than when you started',
    body: 'That’s important, and you don’t have to deal with it alone. Your researcher will be in touch, and support is here now.',
  },
};

type Progress = Record<number, SessionRecord>;

export function programmeFinished(progress: Progress) {
  return Boolean(progress[SESSIONS.length]?.completedAt);
}

/** The last check-in opens once the final session is done, and stays until it's taken. */
export function finalCheckInDue(progress: Progress, final: Phq9Result | undefined) {
  return programmeFinished(progress) && !final;
}

export function sessionsFinished(progress: Progress) {
  return SESSIONS.filter((s) => progress[s.id]?.completedAt).length;
}

/** Every day any practice was done across the programme, counted once. */
export function allPracticeDays(data: PracticeData) {
  return new Set(SESSIONS.flatMap((s) => [...practiceDays(s.id, data)])).size;
}
