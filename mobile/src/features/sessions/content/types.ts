import type { Icon3DName } from '@/components/icons/icon3dSources';

// Each session is data poured into a few reusable module templates, so adding sessions 2–8
// means writing content, not new screens.

export type LessonCard = {
  image: Icon3DName;
  title: string;
  body?: string;
  bullets?: string[];
  chips?: string[];
  /** A video slot; shown as "coming soon" until the animation is produced. */
  video?: { title: string };
};

export type RatingItem = { id: string; label: string; low: string; high: string };

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type ModuleBase = { id: string; title: string; minutes: number };

export type SessionModule =
  | (ModuleBase & { kind: 'lesson'; cards: LessonCard[] })
  | (ModuleBase & { kind: 'ratings'; intro: string; items: RatingItem[] })
  | (ModuleBase & { kind: 'quiz'; intro: string; questions: QuizQuestion[] })
  | (ModuleBase & { kind: 'journal'; prompt: string; hint: string });

export type SessionContent = {
  sessionId: number;
  modules: SessionModule[];
  takeaways: string[];
  practice: string;
};

export const MODULE_IMAGE: Record<SessionModule['kind'], Icon3DName> = {
  lesson: 'notebook',
  ratings: 'chart',
  quiz: 'bulb',
  journal: 'pencil',
};
