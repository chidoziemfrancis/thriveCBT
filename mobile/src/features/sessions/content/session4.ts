import {
  CHALLENGE_BALANCED,
  CHALLENGE_EVIDENCE,
  CHALLENGE_QUESTIONS,
} from '@/features/thoughts/challengeSteps';

import type { SessionContent } from './types';

// Session 4, "Changing Unhelpful Thinking", from the study's CBT intervention structure.
// Wording should be reviewed by the research team.
export const SESSION_4: SessionContent = {
  sessionId: 4,
  hero: 'week4',
  modules: [
    {
      id: 'detective',
      title: 'Be a thought detective',
      minutes: 5,
      icon: 'eye',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week4',
          title: 'Welcome to week 4, {name}',
          body: 'Last week you learned to spot thinking traps. This week is about checking a thought and finding a fairer one.',
          researcherNote: true,
        },
        {
          id: 'on-trial',
          kind: 'video',
          title: 'Put the thought on trial',
          body: 'How a detective checks a thought.',
          slides: [
            { scene: 'pop', text: 'A thought turns up: “I’ll never pass.”' },
            { scene: 'question', text: 'Instead of believing it straight away, you question it.' },
            { scene: 'weigh', text: 'You weigh the evidence on both sides.' },
            {
              scene: 'verdict',
              text: 'And you reach a fairer verdict you can actually live with.',
            },
          ],
        },
      ],
    },
    {
      id: 'evidence',
      title: 'Weigh the evidence',
      minutes: 7,
      icon: 'chart',
      steps: [
        {
          id: 'tobi-evidence',
          kind: 'sort',
          title: 'Tobi’s evidence, weighed',
          body: 'Tobi’s thought: “I’m so stupid. I’ll never pass.” Does each fact support it?',
          prompt: 'Does this support Tobi’s thought?',
          scale: true,
          targets: [
            {
              id: 'for',
              label: 'Supports it',
              hint: 'That one does back the thought up a little.',
            },
            {
              id: 'against',
              label: 'Doesn’t',
              hint: 'That actually goes against the thought, so it doesn’t support it.',
            },
          ],
          scenarios: [
            {
              id: 'tobi',
              label: 'Tobi',
              cards: [
                { id: 'e1', text: 'I got 38% on this test', part: 'for' },
                { id: 'e2', text: 'I passed my last two tests', part: 'against' },
                { id: 'e3', text: 'I barely slept the night before', part: 'against' },
                { id: 'e4', text: 'I found the questions confusing', part: 'for' },
                { id: 'e5', text: 'Half the class said it was hard', part: 'against' },
                { id: 'e6', text: 'My lecturer has office hours', part: 'against' },
              ],
            },
          ],
        },
        { ...CHALLENGE_EVIDENCE, title: 'Now one of yours' },
      ],
    },
    {
      id: 'questions',
      title: 'Ask the questions',
      minutes: 5,
      icon: 'chat',
      steps: CHALLENGE_QUESTIONS,
    },
    {
      id: 'balanced',
      title: 'Build a balanced thought',
      minutes: 4,
      icon: 'pencil',
      steps: CHALLENGE_BALANCED,
    },
    {
      id: 'practice',
      title: 'Practise with real examples',
      minutes: 3,
      icon: 'flag',
      steps: [
        {
          id: 'p1',
          kind: 'choice',
          picture: 'scenario-seen',
          question: 'Your group chat goes quiet after you post. Which thought is most balanced?',
          options: [
            'They all think I said something stupid.',
            'People might just be busy. I can check in later.',
            'I should never post in groups again.',
          ],
          answer: 1,
          explanation:
            'The balanced thought fits the facts: silence has lots of reasons, and it leaves room to act.',
        },
        {
          id: 'p2',
          kind: 'choice',
          picture: 'scenario-exam',
          question: 'A lecturer emails asking to see you. Which thought is most balanced?',
          options: [
            'I’m in serious trouble.',
            'I don’t know what it’s about yet. I can ask.',
            'They’ve always disliked me.',
          ],
          answer: 1,
          explanation:
            'You don’t have the facts yet. A balanced thought admits that, instead of guessing the worst.',
        },
        {
          id: 'p3',
          kind: 'choice',
          picture: 'worry-money',
          question: 'You miss out on a scholarship. Which thought is most balanced?',
          options: [
            'I’m a failure and always will be.',
            'This hurts, and there will be other chances to apply.',
            'Nothing good ever happens to me.',
          ],
          answer: 1,
          explanation:
            'It accepts the disappointment without turning one setback into your whole future.',
        },
        {
          id: 'practice-score',
          kind: 'recap',
          of: 'quiz',
          title: 'Nice work',
          body: 'Spotting the balanced thought gets quicker with practice.',
        },
      ],
    },
  ],
  takeaways: [
    'A thought is a guess to check, not a fact',
    'Weighing the evidence on both sides loosens an unhelpful thought',
    'A balanced thought is fair and realistic, not just positive',
  ],
  practice: 'Challenge one thought a day: weigh the evidence and write a balanced thought.',
  practiceAction: 'challenge',
};
