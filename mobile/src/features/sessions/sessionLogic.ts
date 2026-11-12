import type { RecapStep, SessionContent, SessionStep, SortStep, StepAnswer } from './content/types';
import { emotionLabel } from './emotions';
import { trapLabels } from './traps';

const list = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);

export type SessionRecord = {
  done: string[];
  /** Each step's answer, keyed by step id. */
  answers?: Record<string, StepAnswer>;
  completedAt?: string;
};

export type SessionStatus = 'done' | 'current' | 'available' | 'locked';

/**
 * A new session unlocks each study week; earlier ones stay open to revisit. `unlocked` can run
 * ahead of the week when previewing.
 */
export function sessionStatus(
  sessionId: number,
  week: number,
  record: SessionRecord | undefined,
  unlocked = week
): SessionStatus {
  if (record?.completedAt) return 'done';
  if (sessionId > unlocked) return 'locked';
  if (sessionId > week) return 'available';
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
    case 'recap':
      return true;
    case 'reveal':
      return Array.isArray(answer) && answer.length >= step.cards.length;
    case 'checklist':
      return Array.isArray(answer) && answer.length > 0;
    case 'mythFact':
      return typeof answer === 'boolean';
    case 'compare':
      return answer === true;
    case 'triangle':
      return Array.isArray(answer) && (answer as string[]).includes(FLIPPED);
    case 'sort':
      return sortProgress(step, answer).done;
    case 'emotion':
      return Array.isArray(answer) && answer.length >= 3;
    case 'prompt':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'traps':
      return Array.isArray(answer) && answer.length > 0;
    case 'evidence': {
      const { thought, against } = readEvidence(answer);
      return thought.length > 0 && against.length > 0;
    }
    case 'rate':
      return typeof answer === 'number';
    case 'fields':
      return (
        Array.isArray(answer) &&
        step.fields.every((_, i) => typeof answer[i] === 'string' && (answer[i] as string).trim())
      );
    case 'balanced':
      return Array.isArray(answer) && [0, 1, 2].every((i) => (answer[i] ?? '').toString().trim());
    case 'choice':
    case 'scale':
      return typeof answer === 'number';
    case 'journal':
      return typeof answer === 'string' && answer.trim().length > 0;
  }
}

/** Saved in a triangle answer once the student has tried the kinder thought. */
export const FLIPPED = 'flipped';

/** Prefix for a card the student first placed in the wrong corner. */
export const MISS = 'miss:';

/**
 * A sort answer is the chosen story's id, then each card id as it's placed, plus "miss:<id>"
 * for any card that took a second try.
 */
export function sortProgress(step: SortStep, answer: StepAnswer | undefined) {
  const list = Array.isArray(answer) ? (answer as string[]) : [];
  // With only one story there's nothing to pick, so sorting starts straight away.
  const scenario =
    step.scenarios.length === 1 ? step.scenarios[0] : step.scenarios.find((s) => s.id === list[0]);
  const placed = scenario ? scenario.cards.filter((c) => list.includes(c.id)) : [];
  const missed = scenario ? scenario.cards.filter((c) => list.includes(`${MISS}${c.id}`)) : [];
  return {
    scenario,
    placed,
    next: scenario?.cards.find((c) => !list.includes(c.id)),
    firstTry: placed.length - missed.filter((c) => placed.includes(c)).length,
    done: Boolean(scenario) && placed.length === scenario!.cards.length,
  };
}

/** A thought diary's four answers, read from the steps the recap points at. */
export function diaryAnswers(step: RecapStep, answers: Record<string, StepAnswer>) {
  if (!step.diary) return null;
  const text = (id: string) => {
    const value = answers[id];
    return typeof value === 'string' ? value.trim() : '';
  };
  return {
    situation: text(step.diary.situation),
    thought: text(step.diary.thought),
    feeling: emotionLabel(answers[step.diary.feeling]) ?? '',
    action: step.diary.action ? text(step.diary.action) : '',
    traps: step.diary.traps ? trapLabels(list(answers[step.diary.traps])) : [],
  };
}

/** The diary as one journal entry, so the researcher reads it alongside the student's journal. */
export function diaryText(step: RecapStep, answers: Record<string, StepAnswer>): string | null {
  const diary = diaryAnswers(step, answers);
  if (!diary || !diary.situation) return null;
  return [
    `What happened: ${diary.situation}`,
    `What I thought: ${diary.thought}`,
    `What I felt: ${diary.feeling}`,
    diary.action && `What I did: ${diary.action}`,
    diary.traps.length > 0 && `Thinking trap: ${diary.traps.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}

const FOR = 'for:';
const AGAINST = 'against:';

/** The thought being weighed, and the evidence the student added on each side. */
export function readEvidence(answer: StepAnswer | undefined) {
  const items = Array.isArray(answer) ? (answer as string[]) : [];
  return {
    thought: (items[0] ?? '').trim(),
    for: items.filter((i) => i.startsWith(FOR)).map((i) => i.slice(FOR.length)),
    against: items.filter((i) => i.startsWith(AGAINST)).map((i) => i.slice(AGAINST.length)),
  };
}

export function writeEvidence(thought: string, forItems: string[], against: string[]): string[] {
  return [thought, ...forItems.map((i) => FOR + i), ...against.map((i) => AGAINST + i)];
}

/** "Even though …, I also know …, so …" read back as one sentence. */
export function balancedText(frame: [string, string, string], answer: StepAnswer | undefined) {
  const parts = Array.isArray(answer) ? (answer as string[]).map((p) => (p ?? '').trim()) : [];
  if (parts.length < 3 || parts.some((p) => !p)) return null;
  const clean = (text: string) => text.replace(/[.\s]+$/, '');
  // Mid-sentence words drop their capital, except "I".
  const lower = (text: string) =>
    /^I\b/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
  return `${frame[0]} ${clean(parts[0])}, ${lower(frame[1])} ${clean(parts[1])}, ${lower(frame[2])} ${clean(parts[2])}.`;
}

/** What a reframe changed: the thought, the balanced version, and belief before and after. */
export function reframeAnswers(
  step: RecapStep,
  steps: SessionStep[],
  answers: Record<string, StepAnswer>
) {
  if (!step.reframe) return null;
  const balancedStep = steps.find((s) => s.id === step.reframe!.balanced);
  const number = (id: string) => (typeof answers[id] === 'number' ? (answers[id] as number) : null);
  return {
    thought: readEvidence(answers[step.reframe.evidence]).thought,
    balanced:
      balancedStep?.kind === 'balanced'
        ? balancedText(balancedStep.frame, answers[balancedStep.id])
        : null,
    before: number(step.reframe.before),
    after: number(step.reframe.after),
  };
}

/** A challenged thought as one journal entry, so the researcher can follow the reasoning. */
export function reframeText(
  step: RecapStep,
  steps: SessionStep[],
  answers: Record<string, StepAnswer>
): string | null {
  const r = reframeAnswers(step, steps, answers);
  if (!r || !r.thought || !step.reframe) return null;
  const evidence = readEvidence(answers[step.reframe.evidence]);
  return [
    `Thought: ${r.thought}`,
    evidence.for.length > 0 && `Evidence for: ${evidence.for.join('; ')}`,
    evidence.against.length > 0 && `Evidence against: ${evidence.against.join('; ')}`,
    r.balanced && `Balanced thought: ${r.balanced}`,
    r.before !== null && r.after !== null && `Belief: ${r.before}% before, ${r.after}% after`,
  ]
    .filter(Boolean)
    .join('\n');
}
