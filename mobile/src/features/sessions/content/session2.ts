import type { SessionContent } from './types';

// Session 2, "How Thoughts, Feelings, and Behaviors Are Connected", from the study's CBT
// intervention structure. Wording should be reviewed by the research team.
export const SESSION_2: SessionContent = {
  sessionId: 2,
  hero: 'week2',
  modules: [
    {
      id: 'triangle',
      title: 'The CBT triangle',
      minutes: 8,
      icon: 'bulb',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week2',
          title: 'Welcome to week 2, {name}',
          body: 'Last week was about what depression is. This week is about how your thoughts, feelings and actions feed each other, and how that loop can be changed.',
          researcherNote: true,
        },
        {
          id: 'meet-tobi',
          kind: 'info',
          photo: 'tobi-test',
          title: 'Meet Tobi',
          body: 'Tobi is in second year. Today Tobi gets a test back, and it’s 38%. Let’s follow what happens next.',
        },
        {
          id: 'loop',
          kind: 'triangle',
          title: 'Follow the loop',
          body: 'Tap each corner in turn: what Tobi thinks, then feels, then does.',
          name: 'Tobi',
          before: {
            thought: 'I’m so stupid. I’ll never pass.',
            feeling: 'Ashamed',
            strength: 80,
            action: 'Skips the next lecture',
          },
          after: {
            thought: 'That test was hard. I can ask for help.',
            feeling: 'Disappointed',
            strength: 30,
            action: 'Goes to office hours',
          },
        },
        {
          id: 'myth-feelings',
          kind: 'mythFact',
          statement: 'Feelings just happen. There’s nothing you can do about them.',
          isFact: false,
          explanation:
            'You can’t switch a feeling off, but the thought behind it changes how strong it gets and what you do next. That’s where CBT works.',
        },
        {
          id: 'not-facts',
          kind: 'info',
          photo: 'thoughts',
          title: 'Thoughts aren’t facts',
          body: 'A thought like “I’ll never pass” feels true in the moment, but it’s a guess, not proof. Noticing it is the first step to changing the loop.',
        },
      ],
    },
    {
      id: 'spot',
      title: 'Spot the parts',
      minutes: 6,
      icon: 'flag',
      steps: [
        {
          id: 'sort',
          kind: 'sort',
          title: 'Pick the story closest to you',
          body: 'You’ll sort what happens into thoughts, feelings and actions.',
          scenarios: [
            {
              id: 'exam',
              label: 'The failed exam',
              picture: 'scenario-exam',
              cards: [
                { id: 'exam-1', text: 'Everyone else understood it except me', part: 'thought' },
                { id: 'exam-2', text: 'A heavy sinking feeling', part: 'feeling' },
                { id: 'exam-3', text: 'Stays in bed instead of revising', part: 'do' },
                { id: 'exam-4', text: 'I’m going to fail the whole course', part: 'thought' },
                { id: 'exam-5', text: 'Embarrassed', part: 'feeling' },
                { id: 'exam-6', text: 'Avoids friends from class', part: 'do' },
              ],
            },
            {
              id: 'seen',
              label: 'The message left on “Seen”',
              picture: 'scenario-seen',
              cards: [
                { id: 'seen-1', text: 'They must be angry with me', part: 'thought' },
                { id: 'seen-2', text: 'Anxious', part: 'feeling' },
                { id: 'seen-3', text: 'Checks the phone every few minutes', part: 'do' },
                { id: 'seen-4', text: 'Nobody really wants me around', part: 'thought' },
                { id: 'seen-5', text: 'Hurt', part: 'feeling' },
                { id: 'seen-6', text: 'Stops replying to anyone', part: 'do' },
              ],
            },
            {
              id: 'scroll',
              label: 'Scrolling Instagram',
              picture: 'scenario-scroll',
              cards: [
                { id: 'scroll-1', text: 'Everyone else has it together', part: 'thought' },
                { id: 'scroll-2', text: 'Low and flat', part: 'feeling' },
                { id: 'scroll-3', text: 'Keeps scrolling past midnight', part: 'do' },
                { id: 'scroll-4', text: 'I’m behind in life', part: 'thought' },
                { id: 'scroll-5', text: 'Jealous', part: 'feeling' },
                { id: 'scroll-6', text: 'Cancels plans to go out', part: 'do' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'feelings',
      title: 'Name the feeling',
      minutes: 4,
      icon: 'heart',
      steps: [
        {
          id: 'feelings-intro',
          kind: 'info',
          art: 'heart',
          tone: 'peach',
          title: 'Name it to tame it',
          body: 'Putting an exact name to a feeling makes it easier to handle. “Overwhelmed” tells you more than “bad”.',
        },
        {
          id: 'name-feeling',
          kind: 'emotion',
          title: 'Think of a moment this week that upset you. What did you feel?',
          body: 'Pick the closest family first.',
        },
      ],
    },
    {
      id: 'diary',
      title: 'Your first thought diary',
      minutes: 6,
      icon: 'pencil',
      steps: [
        {
          id: 'diary-situation',
          kind: 'prompt',
          title: 'What happened?',
          hint: 'Pick a recent moment that upset you, big or small. Just the facts.',
          starters: ['In class, ', 'With friends, ', 'At home, ', 'Online, '],
        },
        {
          id: 'diary-thought',
          kind: 'prompt',
          title: 'What went through your mind?',
          hint: 'Write the thought the way it sounded in your head.',
          placeholder: 'e.g. “They think I’m boring”',
        },
        {
          id: 'diary-feeling',
          kind: 'emotion',
          title: 'What did you feel, and how strongly?',
        },
        {
          id: 'diary-action',
          kind: 'prompt',
          title: 'What did you do?',
          hint: 'What you did next, or what you felt like doing.',
        },
        {
          id: 'diary-recap',
          kind: 'recap',
          of: 'diary',
          title: 'Here’s your triangle',
          body: 'This is your thought diary. It’s saved to your journal, and your researcher will look at it before your check-in.',
          diary: {
            situation: 'diary-situation',
            thought: 'diary-thought',
            feeling: 'diary-feeling',
            action: 'diary-action',
          },
        },
      ],
    },
  ],
  takeaways: [
    'Thoughts, feelings and actions feed each other in a loop',
    'Thoughts aren’t facts: they’re worth checking',
    'Naming a feeling exactly makes it easier to handle',
  ],
  practice:
    'Log your mood each day, and fill in one thought diary when something upsets you this week.',
  practiceAction: 'thought-record',
};
