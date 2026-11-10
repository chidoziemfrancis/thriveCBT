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
  cards: {
    id: string;
    icon: FeatureIconName;
    label: string;
    detail: string;
    spot?: BodySpot;
    /** An illustration on the face-down card, in place of the icon. */
    picture?: PhotoKey;
  }[];
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

/** A look back over this part's answers: the check-in as bars, the quiz score, or a diary. */
export type RecapStep = StepBase & {
  kind: 'recap';
  of: 'scales' | 'quiz' | 'diary' | 'reframe';
  title: string;
  body: string;
  /** For a diary: which steps hold each answer, so they can be laid out as a triangle. */
  diary?: { situation: string; thought: string; feeling: string; action?: string; traps?: string };
  /** For a reframe: the evidence, the balanced thought, and belief before and after. */
  reframe?: { evidence: string; balanced: string; before: string; after: string };
};

/** The three corners of the CBT triangle. */
export type CbtPart = 'thought' | 'feeling' | 'do';

export type TriangleSide = { thought: string; feeling: string; strength: number; action: string };

/**
 * One person's thought, feeling and action, tapped corner by corner, then the same moment with
 * a kinder thought so the student watches the feeling and action change.
 */
export type TriangleStep = StepBase & {
  kind: 'triangle';
  title: string;
  body: string;
  name: string;
  before: TriangleSide;
  after: TriangleSide;
};

/**
 * Cards sorted one at a time onto targets: thought, feeling and do by default, or any set such
 * as the thinking traps. With several stories, the student picks one first.
 */
export type SortStep = StepBase & {
  kind: 'sort';
  title: string;
  body: string;
  /** Said above the board while sorting. */
  prompt?: string;
  /** A balance scale above the board tips as cards land on the first or second target. */
  scale?: boolean;
  targets?: { id: string; label: string; hint: string }[];
  scenarios: {
    id: string;
    label: string;
    picture?: PhotoKey;
    cards: { id: string; text: string; part: string }[];
  }[];
};

/**
 * The student's own thought with evidence for and against it. Saved as the thought first, then
 * "for:" and "against:" items.
 */
export type EvidenceStep = StepBase & {
  kind: 'evidence';
  title: string;
  body?: string;
  suggestionsFor?: string[];
  suggestionsAgainst?: string[];
};

/** How much something is believed or felt, 0 to 100%. Can quote the thought being rated. */
export type RateStep = StepBase & {
  kind: 'rate';
  title: string;
  body?: string;
  /** The evidence step whose thought is shown above the slider. */
  quote?: string;
  low?: string;
  high?: string;
};

/** A few short boxes on one screen, e.g. worst, best and most likely. */
export type FieldsStep = StepBase & {
  kind: 'fields';
  title: string;
  hint?: string;
  fields: { label: string; placeholder?: string }[];
};

/** A balanced thought built from a sentence frame, with chips from the student's own evidence. */
export type BalancedStep = StepBase & {
  kind: 'balanced';
  title: string;
  body?: string;
  evidence: string;
  frame: [string, string, string];
};

/** Tag a thought with the thinking traps it might be, or "Not sure". */
export type TrapsStep = StepBase & { kind: 'traps'; title: string; body?: string };

/** Pick a feeling family, then the exact word, then how strong it is. */
export type EmotionStep = StepBase & { kind: 'emotion'; title: string; body?: string };

/** A short written answer, one question per screen, with optional starters. */
export type PromptStep = StepBase & {
  kind: 'prompt';
  title: string;
  hint: string;
  placeholder?: string;
  starters?: string[];
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
  | TriangleStep
  | SortStep
  | EmotionStep
  | PromptStep
  | TrapsStep
  | EvidenceStep
  | RateStep
  | FieldsStep
  | BalancedStep
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
  /** A button under the practice that starts it straight away. */
  practiceAction?: 'thought-record' | 'challenge';
};

/** What a student's answer to a step looks like once saved. */
export type StepAnswer = number | number[] | string[] | boolean | string;
