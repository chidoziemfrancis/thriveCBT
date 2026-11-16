import { NEW_BELIEFS } from '@/features/beliefs/beliefs';

import type { SessionContent } from './types';

// Session 7, "Self-Esteem & Core Beliefs", from the study's CBT intervention structure.
// Wording should be reviewed by the research team.
export const SESSION_7: SessionContent = {
  sessionId: 7,
  hero: 'week7',
  modules: [
    {
      id: 'roots',
      title: 'Roots and leaves',
      minutes: 5,
      icon: 'sun',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week7',
          title: 'Welcome to week 7, {name}',
          body: 'You’ve been catching and checking thoughts. This week you’ll look underneath them, at the beliefs they grow from.',
          researcherNote: true,
        },
        {
          id: 'tree',
          kind: 'reveal',
          figure: 'tree',
          title: 'Thoughts grow from deeper beliefs',
          cards: [
            {
              id: 'leaves',
              icon: 'bulb',
              label: 'Leaves',
              detail:
                'Automatic thoughts, like “I’ll fail this test”. Easy to see, and they change day to day.',
            },
            {
              id: 'branches',
              icon: 'flag',
              label: 'Branches',
              detail:
                'Rules you live by, like “If I’m not the best, I’ve failed”. They connect thoughts to beliefs.',
            },
            {
              id: 'roots',
              icon: 'heart',
              label: 'Roots',
              detail:
                'Core beliefs about yourself, like “I’m not good enough”. Hidden, often learned when you were young.',
            },
          ],
        },
        {
          id: 'belief-myth',
          kind: 'mythFact',
          statement: 'Core beliefs are facts about who I am.',
          isFact: false,
          explanation:
            'They’re conclusions you drew, often early in life, from what happened back then. Like any belief, they can be checked and updated.',
        },
      ],
    },
    {
      id: 'find',
      title: 'Find your core belief',
      minutes: 6,
      icon: 'eye',
      steps: [
        {
          id: 'tobi-arrow',
          kind: 'ladder',
          title: 'Follow the thought down',
          body: 'Tobi’s thought: “I failed the test.” Ask: if that were true, what would it say about me?',
          goal: 'I failed the test',
          rungs: ['I’m not clever enough', 'I’ll never get anywhere', 'I’m a failure'],
          more: ['What would that mean?', 'And if that were true?'],
          lastLabel: 'Core belief',
          lesson:
            'One bad test grew from a belief deep down. Seeing the root explains why the thought hurt so much.',
        },
        {
          id: 'my-arrow',
          kind: 'arrow',
          title: 'Now follow one of yours',
          body: 'Pick a thought from your log or write one. Then keep asking what it would mean about you.',
          question: 'If that were true, what would it say about you?',
          maxDepth: 3,
        },
        {
          id: 'old-belief',
          kind: 'rate',
          title: 'How much do you believe it right now?',
          quote: 'my-arrow',
          low: 'Not at all',
          high: 'Completely',
        },
      ],
    },
    {
      id: 'new',
      title: 'A new, kinder belief',
      minutes: 4,
      icon: 'heart',
      steps: [
        {
          id: 'new-belief',
          kind: 'prompt',
          title: 'What would a fairer belief be?',
          hint: 'Not the opposite, just more balanced and true. Pick one or write your own.',
          starters: NEW_BELIEFS,
          replace: true,
        },
        {
          id: 'new-belief-rate',
          kind: 'rate',
          title: 'How much do you believe this one right now?',
          body: 'It’s fine if it’s low. New beliefs grow with evidence.',
          quote: 'new-belief',
          low: 'Not at all',
          high: 'Completely',
        },
      ],
    },
    {
      id: 'evidence',
      title: 'Collect the evidence',
      minutes: 4,
      icon: 'trophy',
      steps: [
        {
          id: 'positive-intro',
          kind: 'info',
          art: 'trophy',
          tone: 'butter',
          title: 'A positive data log',
          body: 'Old beliefs filter out anything that doesn’t fit. A log catches the evidence you’d usually miss.',
          bullets: [
            'Strengths: things you’re good at, or qualities you have',
            'Wins: anything you did, however small',
            'Kind words: something nice someone said or did',
          ],
        },
        {
          id: 'first-evidence',
          kind: 'fields',
          eyebrow: 'Positive data log',
          title: 'Start with three',
          hint: 'Small counts. “I got out of bed and went to class” is a win.',
          fields: [
            { label: 'A strength I have', placeholder: 'e.g. I’m a loyal friend' },
            { label: 'A win this week', placeholder: 'e.g. I submitted my assignment' },
            {
              label: 'Something kind someone said or did',
              placeholder: 'e.g. My roommate saved me food',
            },
          ],
          positive: ['strength', 'win', 'kind'],
        },
      ],
    },
    {
      id: 'kind',
      title: 'Be kind to yourself',
      minutes: 5,
      icon: 'heart',
      steps: [
        {
          id: 'hard',
          kind: 'prompt',
          title: 'What’s hard for you right now?',
          hint: 'Name it in a few words. This part is just for noticing.',
          starters: ['School', 'Money', 'Feeling alone', 'Family'],
        },
        {
          id: 'not-alone',
          kind: 'info',
          art: 'people',
          tone: 'lavender',
          title: 'You’re not the only one',
          body: 'Many students feel this way, even the ones who look fine. Struggling is part of being human, not a sign that something is wrong with you.',
        },
        {
          id: 'kind-words',
          kind: 'prompt',
          title: 'What would you say to a friend feeling this?',
          hint: 'Now write it to yourself.',
          starters: [
            'It’s okay to find this hard.',
            'You’re doing your best.',
            'One step at a time.',
          ],
        },
        {
          id: 'kind-recap',
          kind: 'recap',
          of: 'compassion',
          title: 'Read it slowly',
          body: 'Your words, back to you.',
          compassion: { hard: 'hard', kind: 'kind-words' },
        },
        {
          id: 'hand-heart',
          kind: 'breathe',
          title: 'Hand on heart',
          body: 'Place a hand on your chest and breathe slowly. Let the kind words settle.',
          cycles: 3,
        },
      ],
    },
  ],
  takeaways: [
    'Automatic thoughts grow from deeper core beliefs',
    'Core beliefs were learned, so they can be updated with new evidence',
    'Speaking to yourself like a friend makes hard moments easier',
  ],
  practice: 'Add one piece of evidence for your new belief every day.',
  practiceAction: 'evidence',
};
