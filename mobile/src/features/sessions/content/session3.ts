import { RECORD_STEPS } from '@/features/thoughts/recordSteps';

import { TRAPS } from '../traps';
import type { SessionContent } from './types';

// Session 3, "Recognizing Negative Thinking Patterns", from the study's CBT intervention
// structure. Wording should be reviewed by the research team.
export const SESSION_3: SessionContent = {
  sessionId: 3,
  hero: 'week3',
  modules: [
    {
      id: 'traps',
      title: 'Thinking traps',
      minutes: 7,
      icon: 'bulb',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week3',
          title: 'Welcome to week 3, {name}',
          body: 'Last week you saw how thoughts drive feelings. This week is about the thoughts that pop up on their own, and the traps they fall into.',
          researcherNote: true,
        },
        {
          id: 'automatic',
          kind: 'video',
          title: 'Automatic thoughts',
          body: 'How unhelpful thoughts slip past us.',
          slides: [
            { scene: 'pop', text: 'A thought pops up in a split second. You don’t choose it.' },
            { scene: 'stamp', text: 'It feels true, so you believe it without checking.' },
            { scene: 'loop', text: 'Believing it pulls your mood down, and round it goes.' },
            {
              scene: 'magnify',
              text: 'This week’s skill: spotting these thoughts as they happen.',
            },
          ],
        },
        {
          id: 'meet-traps',
          kind: 'reveal',
          title: 'Meet the four traps',
          body: 'Tap each card to see what it looks like.',
          cards: TRAPS.map((trap) => ({
            id: trap.id,
            icon: 'bulb' as const,
            label: trap.label,
            detail: `${trap.meaning} ${trap.example}`,
            picture: trap.picture,
          })),
        },
        {
          id: 'myth-true',
          kind: 'mythFact',
          statement: 'If I think it, it must be true.',
          isFact: false,
          explanation:
            'Thoughts are guesses our mind makes, especially when we’re low. Feeling sure of a thought doesn’t make it a fact.',
        },
      ],
    },
    {
      id: 'match',
      title: 'Match the trap',
      minutes: 6,
      icon: 'flag',
      steps: [
        {
          id: 'match-traps',
          kind: 'sort',
          title: 'Thinking traps matched',
          body: 'Match each thought to its trap.',
          prompt: 'Which trap is this?',
          targets: TRAPS.map((t) => ({
            id: t.id,
            label: t.label,
            hint: `That’s ${t.label.toLowerCase()}: ${t.meaning.toLowerCase()}`,
          })),
          scenarios: [
            {
              id: 'student-life',
              label: 'Student life',
              cards: [
                { id: 'm1', text: 'My lecturer must think I’m lazy.', part: 'mind-reading' },
                {
                  id: 'm2',
                  text: 'If I don’t get a first, I’ve wasted my life.',
                  part: 'catastrophising',
                },
                { id: 'm3', text: 'I never get anything right.', part: 'overgeneralising' },
                {
                  id: 'm4',
                  text: 'I got one B, so the whole term was a failure.',
                  part: 'all-or-nothing',
                },
                {
                  id: 'm5',
                  text: 'Everyone in the group chat is laughing at me.',
                  part: 'mind-reading',
                },
                {
                  id: 'm6',
                  text: 'This headache means something is seriously wrong.',
                  part: 'catastrophising',
                },
                { id: 'm7', text: 'People always leave me out.', part: 'overgeneralising' },
                {
                  id: 'm8',
                  text: 'If I can’t do it perfectly, there’s no point trying.',
                  part: 'all-or-nothing',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'record',
      title: 'Catch a thought',
      minutes: 6,
      icon: 'pencil',
      steps: RECORD_STEPS,
    },
  ],
  takeaways: [
    'Automatic thoughts pop up on their own and feel true',
    'Four common traps: catastrophising, mind reading, overgeneralising, all-or-nothing',
    'Writing a thought down and naming the trap takes away some of its power',
  ],
  practice: 'Catch one automatic thought a day this week, and tag the trap in your thought log.',
  practiceAction: 'thought-record',
};
