import type { RecapStep, StepAnswer } from '@/features/sessions/content/types';
import { NOT_SURE, TRAPS } from '@/features/sessions/traps';

export type ThoughtRecord = {
  id: string;
  at: string;
  situation: string;
  thought: string;
  /** Family, word and strength, as the emotion picker saves them. */
  feeling: string[];
  action?: string;
  traps: string[];
  sessionId?: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const text = (value: StepAnswer | undefined) => (typeof value === 'string' ? value.trim() : '');
const list = (value: StepAnswer | undefined) => (Array.isArray(value) ? (value as string[]) : []);

/** A finished diary or thought record from a session, in the same shape as one written later. */
export function recordFromDiary(
  step: RecapStep,
  answers: Record<string, StepAnswer>
): Omit<ThoughtRecord, 'id' | 'at'> | null {
  if (!step.diary) return null;
  const situation = text(answers[step.diary.situation]);
  if (!situation) return null;
  return {
    situation,
    thought: text(answers[step.diary.thought]),
    feeling: list(answers[step.diary.feeling]),
    action: step.diary.action ? text(answers[step.diary.action]) || undefined : undefined,
    traps: step.diary.traps ? list(answers[step.diary.traps]) : [],
  };
}

/** How often each trap was tagged in the last seven days, most frequent first. */
export function trapCounts(records: ThoughtRecord[], now = new Date()) {
  const since = now.getTime() - WEEK_MS;
  const recent = records.filter((r) => new Date(r.at).getTime() >= since);
  return TRAPS.map((trap) => ({
    ...trap,
    count: recent.filter((r) => r.traps.includes(trap.id)).length,
  }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function isTagged(record: ThoughtRecord) {
  return record.traps.some((t) => t !== NOT_SURE);
}
