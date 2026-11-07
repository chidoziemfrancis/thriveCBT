import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';
import type { BodySpot } from '@/features/sessions/art/BodyFigure';
import type { ScaleArtName } from '@/features/sessions/art/ScaleArt';
import type { StoryScene } from '@/features/sessions/art/StoryArt';
import type { PhotoKey } from '@/features/sessions/photos';

// Each session is data poured into a handful of reusable step templates, so adding sessions
// 2–8 means writing content, not new screens. Every step is one idea on one screen, and most
// ask the student to do something rather than just read.

type StepBase = { id: string };

/** A short idea with a picture: the backbone of each lesson. */
export type InfoStep = StepBase & {
  kind: 'info';
  /** A real photo above the text; otherwise the drawn art. */
  photo?: PhotoKey;
  art?: FeatureIconName;
  tone?: FeatureIconTone;
  /** "{name}" is replaced with the student's first name. */
  title: string;
  body: string;
  bullets?: string[];
  /** Shows the student's researcher and when they'll talk about this. */
  researcherNote?: boolean;
  /** Shows the 8-week path with this week marked. */
  path?: boolean;
};

/** Cards the student taps to turn over, so they uncover the ideas themselves. */
export type RevealStep = StepBase & {
  kind: 'reveal';
  title: string;
  body?: string;
  cards: { id: string; icon: FeatureIconName; label: string; detail: string; spot?: BodySpot }[];
  /** Cards sit on a drawing of a person instead of in a grid. */
  figure?: 'body';
};

/** The checklist answer for "None of these", which clears every other pick. */
export const CHECKLIST_NONE = -1;

/** "Which of these sound like you?", answered with a kind, personal reply. */
export type ChecklistStep = StepBase & {
  kind: 'checklist';
  title: string;
  body?: string;
  options: string[];
  /** One photo per option, shown as picture tiles. */
  photos?: PhotoKey[];
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
  /** A picture on the question card: an illustration or a drawn scene. */
  picture?: PhotoKey;
  art?: ScaleArtName;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

/** A 1–5 self-rating, one area per screen. */
export type ScaleStep = StepBase & {
  kind: 'scale';
  /** A drawing that moves with the answer: 5 is its fullest. */
  art?: ScaleArtName;
  /** One word for the recap, e.g. "Sleep". */
  short?: string;
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

/** A video slot. Until the video is made, its story plays as illustrated slides. */
export type VideoStep = StepBase & {
  kind: 'video';
  title: string;
  body: string;
  slides?: { scene: StoryScene; text: string }[];
};

/** A slider over time that shows how a passing low differs from one that stays. */
export type CompareStep = StepBase & {
  kind: 'compare';
  title: string;
  left: string;
  right: string;
  start: string;
  end: string;
  /** Said once the slider reaches the end. */
  lesson: string;
};

export type JournalStep = StepBase & {
  kind: 'journal';
  prompt: string;
  hint: string;
  /** Chips that start the entry for the student, so the box is never blank. */
  starters?: { label: string; text: string }[];
};

/** A look back over this part's answers: the check-in as bars, or the quiz score. */
export type RecapStep = StepBase & {
  kind: 'recap';
  of: 'scales' | 'quiz';
  title: string;
  body: string;
};

export type SessionStep =
  | InfoStep
  | RevealStep
  | ChecklistStep
  | MythFactStep
  | ChoiceStep
  | ScaleStep
  | BreatheStep
  | VideoStep
  | CompareStep
  | RecapStep
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
  /** The photo at the top of the session's opening screen. */
  hero?: PhotoKey;
  modules: SessionModule[];
  takeaways: string[];
  practice: string;
};

/** What a student's answer to a step looks like once saved. */
export type StepAnswer = number | number[] | string[] | boolean | string;
