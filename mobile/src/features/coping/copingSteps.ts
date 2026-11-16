import type {
  RecapStep,
  SafetyStep,
  SessionStep,
  StepAnswer,
} from '@/features/sessions/content/types';

import type { CrisisPlan } from './coping';

// The crisis plan, shared by Session 6 and the plan's own edit screen. Based on the
// Stanley-Brown safety plan; wording should be reviewed by the research team.
export const CRISIS_SAFETY: SafetyStep[] = [
  {
    id: 'crisis-warning',
    kind: 'safety',
    section: 'warning',
    title: 'What are your warning signs?',
    hint: 'The thoughts, feelings or habits that tell you things are getting bad.',
    suggestions: [
      'I stop eating properly',
      'I don’t reply to anyone',
      'I can’t sleep or sleep all day',
      'I feel like a burden',
      'I skip all my lectures',
    ],
  },
  {
    id: 'crisis-alone',
    kind: 'safety',
    section: 'alone',
    title: 'What can you do on your own to feel a bit better?',
    hint: 'Things from your toolkit, or anything that helps you get through.',
    suggestions: ['Take a cold shower', 'Go for a walk', 'Pray', 'Listen to music'],
  },
  {
    id: 'crisis-distract',
    kind: 'safety',
    section: 'distract',
    title: 'Where can you go, or who can you be with, to take your mind off it?',
    hint: 'You don’t have to talk about how you feel. Just be around people.',
    suggestions: ['The library', 'A friend’s room', 'Fellowship or mosque', 'The sports field'],
  },
  {
    id: 'crisis-people',
    kind: 'safety',
    section: 'people',
    title: 'Who can you ask for help?',
    hint: 'People you trust to listen. Add a number so you can call in one tap.',
  },
  {
    id: 'crisis-pros',
    kind: 'safety',
    section: 'pros',
    title: 'Professionals and helplines',
    hint: 'These are already in your plan. Add anyone else, like a doctor or counsellor.',
  },
  {
    id: 'crisis-safe',
    kind: 'safety',
    section: 'safe',
    title: 'How can you make your space safer?',
    hint: 'Ways to keep things you might hurt yourself with out of reach. You can skip this.',
    suggestions: [
      'Ask a roommate to keep my medicine',
      'Keep sharp things away from my bed',
      'Stay with a friend on hard nights',
    ],
  },
];

export const CRISIS_RECAP: RecapStep = {
  id: 'crisis-recap',
  kind: 'recap',
  of: 'safety',
  title: 'Your crisis plan',
  body: 'Saved on the Support screen. Open it whenever things feel too much, and work down the list.',
};

export const CRISIS_STEPS: SessionStep[] = [...CRISIS_SAFETY, CRISIS_RECAP];

/** A saved plan as step answers, so editing starts from what's already there. */
export function crisisAnswers(plan: CrisisPlan | null): Record<string, StepAnswer> {
  const answers: Record<string, StepAnswer> = {};
  for (const step of CRISIS_SAFETY) {
    const items = plan?.[step.section];
    if (items?.length) answers[step.id] = items;
  }
  return answers;
}

export const STRESS_STEPS: SessionStep[] = [
  {
    id: 'stress-situation',
    kind: 'prompt',
    title: 'What happened?',
    hint: 'The moment that stressed you. Just the facts.',
    starters: ['Before an exam, ', 'At home, ', 'In the hostel, ', 'About money, '],
  },
  {
    id: 'stress-level',
    kind: 'rate',
    title: 'How stressed did you feel?',
    low: 'A little',
    high: 'Overwhelmed',
  },
  {
    id: 'stress-helped',
    kind: 'prompt',
    title: 'What helped, or what could?',
    hint: 'Something you did, or something from your toolkit to try next time.',
    starters: ['Box breathing', 'A walk', 'Talking to a friend', 'Nothing yet'],
  },
];
