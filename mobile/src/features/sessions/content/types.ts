import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';

// Each session is data poured into a handful of reusable step templates, so adding sessions
// 2–8 means writing content, not new screens. Every step is one idea on one screen, and most
// ask the student to do something rather than just read.

type StepBase = { id: string };

/** A short idea with a picture: the backbone of each lesson. */
export type InfoStep = StepBase & {
  kind: 'info';
  art: FeatureIconName;
  tone?: FeatureIconTone;
  title: string;
  body: string;
  bullets?: string[];
};

/** Cards the student taps to turn over, so they uncover the ideas themselves. */
export type RevealStep = StepBase & {
  kind: 'reveal';
  title: string;
  body?: string;
  cards: { id: string; icon: FeatureIconName; label: string; detail: string }[];
};

/** "Which of these sound like you?", answered with a kind, personal reply. */
export type ChecklistStep = StepBase & {
  kind: 'checklist';
  title: string;
  body?: string;
  options: string[];
  /** Shown after picking at least one option. */
  responseSome: string;
  responseNone: string;
};

/** A common belief to sort into myth or fact, with the reason revealed straight after. */
export type MythFactStep = StepBase & {
  kind: 'mythFact';
  statement: string;
  isFact: boolean;
  explanation: string;
};

/** A multiple-choice check with instant feedback. */
export type ChoiceStep = StepBase & {
  kind: 'choice';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

/** A 1–5 self-rating, one area per screen. */
export type ScaleStep = StepBase & {
  kind: 'scale';
  title: string;
  low: string;
  high: string;
};

/** A paced breathing exercise: a calm pause in the middle of a session. */
export type BreatheStep = StepBase & {
  kind: 'breathe';
  title: string;
  body: string;
  cycles: number;
};

/** A video slot; shown as "coming soon" until the animation is produced. */
export type VideoStep = StepBase & { kind: 'video'; title: string; body: string };

export type JournalStep = StepBase & { kind: 'journal'; prompt: string; hint: string };

export type SessionStep =
  | InfoStep
  | RevealStep
  | ChecklistStep
  | MythFactStep
  | ChoiceStep
  | ScaleStep
  | BreatheStep
  | VideoStep
  | JournalStep;

export type SessionModule = {
  id: string;
  title: string;
  minutes: number;
  icon: FeatureIconName;
  steps: SessionStep[];
};

export type SessionContent = {
  sessionId: number;
  modules: SessionModule[];
  takeaways: string[];
  practice: string;
};

/** What a student's answer to a step looks like once saved. */
export type StepAnswer = number | number[] | string[] | boolean | string;
