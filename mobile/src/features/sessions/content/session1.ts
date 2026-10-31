import type { SessionContent } from './types';

// Session 1, "Understanding Depression and Emotional Well-Being", from the study's CBT
// intervention structure. Wording should be reviewed by the research team.
export const SESSION_1: SessionContent = {
  sessionId: 1,
  modules: [
    {
      id: 'lesson',
      title: 'Understanding depression',
      minutes: 10,
      icon: 'book',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          art: 'heart',
          tone: 'peach',
          title: 'Welcome to Session 1',
          body: 'Over the next few minutes we’ll look at what depression is, how it shows up, and why it can get better. Go at your own pace.',
        },
        {
          id: 'myth-sad',
          kind: 'mythFact',
          statement: 'Depression is just feeling sad.',
          isFact: false,
          explanation:
            'Sadness usually passes in a day or two. Depression lasts for weeks and affects how you think, feel, sleep and act.',
        },
        {
          id: 'what-is',
          kind: 'info',
          art: 'umbrella',
          tone: 'lavender',
          title: 'What is depression?',
          body: 'A common mental health condition that affects how you feel, think and handle daily life. It goes beyond ordinary sadness and can last for weeks at a time.',
        },
        {
          id: 'four-ways',
          kind: 'reveal',
          title: 'It shows up in four ways',
          body: 'Tap each card to see how.',
          cards: [
            {
              id: 'thoughts',
              icon: 'bulb',
              label: 'Thoughts',
              detail: 'Harsh or hopeless thoughts, like “I always mess things up”.',
            },
            {
              id: 'feelings',
              icon: 'heart',
              label: 'Feelings',
              detail: 'Sadness, emptiness, irritability, or feeling numb.',
            },
            {
              id: 'body',
              icon: 'sun',
              label: 'Body',
              detail: 'Sleeping too much or too little, low energy, appetite changes.',
            },
            {
              id: 'behaviour',
              icon: 'flag',
              label: 'Behaviour',
              detail: 'Pulling away from friends, skipping classes, dropping hobbies.',
            },
          ],
        },
        {
          id: 'noticed',
          kind: 'checklist',
          title: 'Have you noticed any of these lately?',
          body: 'Pick any that fit. There are no wrong answers.',
          options: [
            'Low mood most days',
            'Losing interest in things I enjoy',
            'Changes in sleep',
            'Feeling tired or low on energy',
            'Trouble concentrating',
            'Pulling away from people',
          ],
          responseSome:
            'Thank you for being honest. These are common, and they’re exactly what this programme is here to help with.',
          responseNone:
            'That’s good to hear. Keep an eye out for them, and remember your researcher is here if anything changes.',
        },
        {
          id: 'pressures',
          kind: 'checklist',
          title: 'What weighs on you most right now?',
          body: 'Many students feel low because of pressures like these.',
          options: [
            'Academic stress',
            'Loneliness',
            'Money worries',
            'Relationship problems',
            'Family pressure',
          ],
          responseSome:
            'Naming what weighs on you is a real first step. We’ll come back to these as the weeks go on.',
          responseNone: 'That’s okay. Not everyone can put a name to it, and that’s fine too.',
        },
        {
          id: 'video',
          kind: 'video',
          title: 'What happens in depression?',
          body: 'A short animation about what happens in your mind and body during depression.',
        },
        {
          id: 'breathe',
          kind: 'breathe',
          title: 'Let’s pause for a breath',
          body: 'Breathe in as the circle grows, and out as it shrinks.',
          cycles: 3,
        },
        {
          id: 'myth-weak',
          kind: 'mythFact',
          statement: 'Depression means you’re weak.',
          isFact: false,
          explanation:
            'Depression is a health condition, not a weakness. It can affect anyone, and reaching out for help takes strength.',
        },
        {
          id: 'better',
          kind: 'info',
          art: 'sun',
          tone: 'butter',
          title: 'It can get better',
          body: 'Depression is treatable. Over the next 8 weeks, CBT will help you notice how your thoughts, feelings and actions connect, and give you practical skills to feel better, one small step at a time.',
        },
      ],
    },
    {
      id: 'mood-check',
      title: 'Mood self-check',
      minutes: 3,
      icon: 'chart',
      steps: [
        {
          id: 'mood-intro',
          kind: 'info',
          art: 'chart',
          title: 'A quick self-check',
          body: 'Five quick questions about the past week. Just tap the number that fits best.',
        },
        {
          id: 'sadness',
          kind: 'scale',
          title: 'How sad have you felt?',
          low: 'Not sad',
          high: 'Very sad',
        },
        {
          id: 'motivation',
          kind: 'scale',
          title: 'How has your motivation been?',
          low: 'Very low',
          high: 'Very high',
        },
        {
          id: 'sleep',
          kind: 'scale',
          title: 'How well have you slept?',
          low: 'Very poorly',
          high: 'Very well',
        },
        {
          id: 'energy',
          kind: 'scale',
          title: 'How has your energy been?',
          low: 'Very low',
          high: 'Very high',
        },
        {
          id: 'concentration',
          kind: 'scale',
          title: 'How easily could you concentrate?',
          low: 'Very hard',
          high: 'Very easy',
        },
      ],
    },
    {
      id: 'quiz',
      title: 'Quick quiz',
      minutes: 3,
      icon: 'bulb',
      steps: [
        {
          id: 'q1',
          kind: 'choice',
          question: 'Depression is the same as ordinary sadness that passes quickly.',
          options: ['True', 'False'],
          answer: 1,
          explanation:
            'Depression goes beyond ordinary sadness. It can last for weeks and affects how you think, feel and live day to day.',
        },
        {
          id: 'q2',
          kind: 'choice',
          question: 'Which of these can depression affect?',
          options: ['Sleep and appetite', 'Only your mood', 'Nothing physical'],
          answer: 0,
          explanation:
            'Depression affects the body too, including sleep, appetite and energy, not just mood.',
        },
        {
          id: 'q3',
          kind: 'choice',
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
      title: 'Reflection journal',
      minutes: 5,
      icon: 'pencil',
      steps: [
        {
          id: 'reflect',
          kind: 'journal',
          prompt: 'What has depression affected most in your life?',
          hint: 'There’s no right answer. A few honest sentences is plenty.',
        },
      ],
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
