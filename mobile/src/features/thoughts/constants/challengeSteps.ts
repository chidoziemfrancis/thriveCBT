import type { EvidenceStep, RecapStep, SessionStep } from '@/features/sessions/content/types';

// Checking a thought, shared by Session 4 and the "Challenge a thought" flow.
export const CHALLENGE_EVIDENCE: EvidenceStep = {
  id: 'challenge-evidence',
  kind: 'evidence',
  title: 'Weigh the evidence',
  body: 'Pick a thought to check. Then add what supports it and what doesn’t.',
  suggestionsFor: ['It’s happened before', 'It feels really true'],
  suggestionsAgainst: [
    'It went better than I feared last time',
    'A friend would see it differently',
    'I’ve coped with hard things before',
    'I don’t actually know what others think',
  ],
};

export const CHALLENGE_QUESTIONS: SessionStep[] = [
  {
    id: 'challenge-true',
    kind: 'rate',
    title: 'Is this thought 100% true?',
    body: 'How much do you believe it right now?',
    quote: 'challenge-evidence',
    low: 'Not at all',
    high: 'Completely',
  },
  {
    id: 'challenge-friend',
    kind: 'prompt',
    title: 'What would you tell a friend who thought this?',
    hint: 'Be as kind to yourself as you would be to them.',
    starters: ['I’d tell them ', 'It’s okay to '],
  },
  {
    id: 'challenge-outcomes',
    kind: 'fields',
    title: 'Worst, best and most likely?',
    hint: 'Picture each one. The most likely is usually somewhere in the middle.',
    fields: [
      { label: 'The worst that could happen' },
      { label: 'The best that could happen' },
      { label: 'What will most likely happen' },
    ],
  },
  {
    id: 'challenge-year',
    kind: 'prompt',
    title: 'Will this matter in a year?',
    hint: 'Zoom out for a moment.',
    starters: ['Probably not, ', 'A little, but '],
  },
];

export const CHALLENGE_RECAP: RecapStep = {
  id: 'challenge-recap',
  kind: 'recap',
  of: 'reframe',
  title: 'Your thought, rebalanced',
  body: 'Saved to your thought log. Your researcher can see it before your check-in.',
  reframe: {
    evidence: 'challenge-evidence',
    balanced: 'challenge-balanced',
    before: 'challenge-true',
    after: 'challenge-after',
  },
};

export const CHALLENGE_BALANCED: SessionStep[] = [
  {
    id: 'challenge-balanced',
    kind: 'balanced',
    title: 'Build a balanced thought',
    body: 'Use your evidence: tap a suggestion or write your own.',
    evidence: 'challenge-evidence',
    frame: ['Even though', 'I also know', 'So'],
  },
  {
    id: 'challenge-after',
    kind: 'rate',
    title: 'How much do you believe the old thought now?',
    quote: 'challenge-evidence',
    low: 'Not at all',
    high: 'Completely',
  },
  CHALLENGE_RECAP,
];

export const CHALLENGE_STEPS: SessionStep[] = [
  CHALLENGE_EVIDENCE,
  ...CHALLENGE_QUESTIONS,
  ...CHALLENGE_BALANCED,
];
