import type { RecapStep, SessionStep } from '@/features/sessions/content/types';

// The questions of a thought record, shared by Session 3 and the thought log so both feel the same.
export const RECORD_RECAP: RecapStep = {
  id: 'record-recap',
  kind: 'recap',
  of: 'diary',
  title: 'Your thought record',
  body: 'Saved to your thought log and journal. Your researcher can look at it before your check-in.',
  diary: {
    situation: 'record-situation',
    thought: 'record-thought',
    feeling: 'record-feeling',
    traps: 'record-traps',
  },
};

export const RECORD_STEPS: SessionStep[] = [
  {
    id: 'record-situation',
    kind: 'prompt',
    title: 'What happened?',
    hint: 'The moment that set it off. Just the facts.',
    starters: ['In class, ', 'With friends, ', 'At home, ', 'Online, '],
  },
  {
    id: 'record-thought',
    kind: 'prompt',
    title: 'What was the automatic thought?',
    hint: 'The first thing that popped into your head, word for word.',
    placeholder: 'e.g. “Everyone is judging me”',
  },
  { id: 'record-feeling', kind: 'emotion', title: 'What did you feel, and how strongly?' },
  {
    id: 'record-traps',
    kind: 'traps',
    title: 'Which trap might it be?',
    body: 'Pick any that fit. It’s fine to be unsure.',
  },
  RECORD_RECAP,
];
