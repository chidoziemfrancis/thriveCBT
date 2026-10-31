import type { SessionContent } from './types';

// Session 1, "Understanding Depression and Emotional Well-Being", from the study's
// CBT intervention structure. Wording should be reviewed by the research team.
export const SESSION_1: SessionContent = {
  sessionId: 1,
  modules: [
    {
      id: 'lesson',
      kind: 'lesson',
      title: 'Understanding depression',
      minutes: 10,
      cards: [
        {
          emoji: 'cloudRain',
          title: 'What is depression?',
          body: 'Depression is a common mental health condition that affects how you feel, think and handle daily life. It goes beyond ordinary sadness and can last for weeks at a time.',
        },
        {
          emoji: 'brain',
          title: 'It shows up in many ways',
          body: 'Depression can affect your thoughts, emotions, behaviour and body. Common signs include:',
          bullets: [
            'Persistent sadness or low mood',
            'Losing interest in things you used to enjoy',
            'Changes in sleep or appetite',
            'Low energy or feeling tired',
            'Trouble concentrating',
          ],
        },
        {
          emoji: 'graduationCap',
          title: 'Common causes for students',
          body: 'Many undergraduates feel this way, often because of pressures like:',
          chips: [
            'Academic stress',
            'Relationship problems',
            'Loneliness',
            'Money worries',
            'Family pressure',
          ],
        },
        {
          emoji: 'clapper',
          title: 'What happens in depression?',
          body: 'A short animated video explaining what happens in your mind and body during depression.',
          video: { title: 'What Happens in Depression?' },
        },
        {
          emoji: 'seedling',
          title: 'It can get better',
          body: 'Depression is treatable. Over the next 8 weeks, CBT will help you notice how your thoughts, feelings and actions connect, and give you practical skills to feel better, one small step at a time.',
        },
      ],
    },
    {
      id: 'mood-check',
      kind: 'ratings',
      title: 'Mood self-check',
      minutes: 3,
      intro: 'Rate how each of these has been for you over the past week.',
      items: [
        { id: 'sadness', label: 'Sadness', low: 'Not sad', high: 'Very sad' },
        { id: 'motivation', label: 'Motivation', low: 'Very low', high: 'Very high' },
        { id: 'sleep', label: 'Sleep', low: 'Very poor', high: 'Very good' },
        { id: 'energy', label: 'Energy', low: 'Very low', high: 'Very high' },
        { id: 'concentration', label: 'Concentration', low: 'Very poor', high: 'Very good' },
      ],
    },
    {
      id: 'quiz',
      kind: 'quiz',
      title: 'Quick quiz',
      minutes: 3,
      intro:
        'Three quick questions on what you just read. No pressure, it’s just to help it stick.',
      questions: [
        {
          id: 'q1',
          question: 'Depression is the same as ordinary sadness that passes quickly.',
          options: ['True', 'False'],
          answer: 1,
          explanation:
            'Depression goes beyond ordinary sadness. It can last for weeks and affects how you think, feel and live day to day.',
        },
        {
          id: 'q2',
          question: 'Which of these can depression affect?',
          options: ['Sleep and appetite', 'Only your mood', 'Nothing physical'],
          answer: 0,
          explanation:
            'Depression affects the body too, including sleep, appetite and energy, not just mood.',
        },
        {
          id: 'q3',
          question: 'Academic stress can contribute to depression in undergraduates.',
          options: ['True', 'False'],
          answer: 0,
          explanation:
            'Academic stress is one of the most common contributors for students, along with loneliness, money worries and relationship or family pressure.',
        },
      ],
    },
    {
      id: 'journal',
      kind: 'journal',
      title: 'Reflection journal',
      minutes: 5,
      prompt: 'What has depression affected most in your life?',
      hint: 'There’s no right answer. A few honest sentences is plenty.',
    },
  ],
  takeaways: [
    'Depression is more than sadness and is common among students',
    'It can affect your thoughts, feelings, behaviour and body',
    'It’s treatable, and small steps really do add up',
  ],
  practice:
    'Log your mood on Home each day this week, so you and your researcher can see how it changes.',
};
