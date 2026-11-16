import type { SessionContent } from './types';

// Session 5, "Behavioral Activation", from the study's CBT intervention structure.
// Wording should be reviewed by the research team.
export const SESSION_5: SessionContent = {
  sessionId: 5,
  hero: 'week5',
  modules: [
    {
      id: 'loop',
      title: 'The low-mood loop',
      minutes: 5,
      icon: 'bulb',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week5',
          title: 'Welcome to week 5, {name}',
          body: 'So far you’ve worked on thoughts. This week is about what you do, because small actions can lift your mood too.',
          researcherNote: true,
        },
        {
          id: 'ada-loop',
          kind: 'video',
          title: 'Ada’s week',
          body: 'How doing less keeps a low mood going.',
          slides: [
            {
              scene: 'withdraw',
              text: 'Ada feels low, so she skips lectures and stays in her room.',
            },
            {
              scene: 'spiral',
              text: 'With less going on, there’s less to enjoy. She feels worse, and does even less.',
            },
            {
              scene: 'energy',
              text: 'She waits to feel like doing things. That feeling doesn’t come.',
            },
            {
              scene: 'steps',
              text: 'Then she takes one small step: a short walk. Then another. The loop starts to turn.',
            },
          ],
        },
        {
          id: 'motivation-myth',
          kind: 'mythFact',
          statement: 'I should wait until I feel motivated before I do things.',
          isFact: false,
          explanation:
            'When you’re low, motivation usually comes after you start, not before. Action comes first, and the feeling follows.',
        },
        {
          id: 'ada-choice',
          kind: 'choice',
          question: 'Ada has felt low all week. Which step is most likely to help today?',
          options: [
            'Stay in bed until she feels ready',
            'A 10-minute walk with a friend',
            'Revise every course tonight to catch up',
          ],
          answer: 1,
          explanation:
            'Small and doable beats big and overwhelming. A short walk with someone gives a little enjoyment and connection.',
        },
      ],
    },
    {
      id: 'lift',
      title: 'What lifts you',
      minutes: 5,
      icon: 'heart',
      steps: [
        {
          id: 'three-kinds',
          kind: 'info',
          art: 'sun',
          tone: 'butter',
          title: 'Three kinds of activity',
          body: 'Activities that lift mood usually give you at least one of these.',
          bullets: [
            'Enjoyment: something you like doing',
            'Achievement: something that gives a sense of getting things done',
            'Connection: time with people who matter to you',
          ],
        },
        {
          id: 'pick',
          kind: 'activities',
          title: 'Which of these could you do this week?',
          body: 'Pick a few, or add your own.',
        },
        {
          id: 'rate-picks',
          kind: 'pleasure',
          title: 'What would each one give you?',
          body: 'Rate enjoyment and achievement from 0 to 10. A guess is fine.',
          from: 'pick',
        },
      ],
    },
    {
      id: 'smaller',
      title: 'Make it smaller',
      minutes: 4,
      icon: 'flag',
      steps: [
        {
          id: 'ladder',
          kind: 'ladder',
          title: 'Big tasks feel impossible when you’re low',
          body: 'So break one down until the first step feels easy.',
          goal: 'Revise for exams',
          rungs: [
            'Revise one course this week',
            'Go over one topic',
            'Read my notes on it for 10 minutes',
            'Open my notes and read one page',
          ],
          lesson:
            'That’s a step you could take today. Once you’ve started, the next one is easier.',
        },
        {
          id: 'own-task',
          kind: 'fields',
          eyebrow: 'Make it smaller',
          title: 'Now one of yours',
          hint: 'Something you’ve been putting off, and a first step small enough to do this week.',
          fields: [
            { label: 'Something I’ve been putting off', placeholder: 'e.g. Start my assignment' },
            { label: 'My first small step', placeholder: 'e.g. Write the title and one line' },
          ],
        },
      ],
    },
    {
      id: 'plan',
      title: 'Plan your week',
      minutes: 5,
      icon: 'calendar',
      steps: [
        {
          id: 'appointment',
          kind: 'info',
          art: 'calendar',
          tone: 'mint',
          title: 'Plan it like an appointment',
          body: 'Activities you give a day and a time are far more likely to happen. Aim for three small ones this week.',
        },
        {
          id: 'week-plan',
          kind: 'planner',
          title: 'Plan three activities',
          body: 'Pick a day, then add something from your list.',
          from: ['pick', 'own-task'],
          goal: 3,
        },
        {
          id: 'notice',
          kind: 'info',
          art: 'checkCircle',
          tone: 'lavender',
          title: 'Then notice how it felt',
          body: 'After each one, tick it off in My week and rate how it went. It often turns out better than you guessed.',
        },
      ],
    },
  ],
  takeaways: [
    'Low mood makes you do less, and doing less keeps mood low',
    'Action comes first; motivation often follows',
    'Small, planned activities for enjoyment, achievement and connection lift mood',
  ],
  practice: 'Do the activities you planned, then rate how they felt in My week.',
  practiceAction: 'plan',
};
