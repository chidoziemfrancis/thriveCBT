import { CRISIS_STEPS } from '@/features/coping/copingSteps';

import type { SessionContent } from './types';

// Session 6, "Managing Stress & Emotions", from the study's CBT intervention structure.
// Wording should be reviewed by the research team.
export const SESSION_6: SessionContent = {
  sessionId: 6,
  hero: 'week6',
  modules: [
    {
      id: 'stress',
      title: 'What stress does',
      minutes: 5,
      icon: 'heart',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week6',
          title: 'Welcome to week 6, {name}',
          body: 'Stress and low mood feed each other. This week you’ll learn to notice stress early and calm it down.',
          researcherNote: true,
        },
        {
          id: 'body-map',
          kind: 'bodyMap',
          title: 'Where do you feel stress?',
          body: 'Stress shows up in the body before we notice it in our thoughts. Tap every place that sounds like you.',
          response:
            'Those are your early warning signs. When you notice them, it’s a cue to slow down and use a tool.',
        },
        {
          id: 'chidi-bucket',
          kind: 'video',
          title: 'Chidi’s stress bucket',
          body: 'Why stress spills over.',
          slides: [
            {
              scene: 'bucket',
              text: 'Exams, money, a noisy hostel, family calls: each one pours a little into Chidi’s bucket.',
            },
            {
              scene: 'energy',
              text: 'With no way to empty it, it fills up. He snaps at friends and can’t sleep.',
            },
            {
              scene: 'drain',
              text: 'Coping tools are a tap at the bottom. Using them lets stress drain out as it comes in.',
            },
          ],
        },
        {
          id: 'stress-myth',
          kind: 'mythFact',
          statement: 'All stress is bad for you.',
          isFact: false,
          explanation:
            'A little stress helps you focus before an exam. It’s stress that piles up with no break that wears you down.',
        },
      ],
    },
    {
      id: 'triggers',
      title: 'Your triggers',
      minutes: 4,
      icon: 'flag',
      steps: [
        {
          id: 'my-triggers',
          kind: 'triggers',
          title: 'What fills your bucket?',
          body: 'Pick what stresses you, then rate how much each one does.',
        },
        {
          id: 'log-intro',
          kind: 'info',
          art: 'chart',
          tone: 'peach',
          title: 'Keep a stress log',
          body: 'When something stresses you this week, log it: what happened, how strong it was, and what helped. Patterns show up quickly.',
        },
      ],
    },
    {
      id: 'calm',
      title: 'Calm your body',
      minutes: 8,
      icon: 'sun',
      steps: [
        {
          id: 'brake',
          kind: 'info',
          art: 'sun',
          tone: 'mint',
          title: 'Your body has a brake',
          body: 'Stress speeds your body up. Slow breathing and relaxing your muscles press the brake. Try three ways now.',
        },
        {
          id: 'box',
          kind: 'relax',
          exercise: 'box',
          title: 'Box breathing',
          body: 'Follow the dot round the square: in, hold, out, hold.',
        },
        {
          id: 'muscle',
          kind: 'relax',
          exercise: 'muscle',
          title: 'Muscle relaxation',
          body: 'Tense each part for a few seconds, then let it go.',
        },
        {
          id: 'grounding',
          kind: 'relax',
          exercise: 'grounding',
          title: '5-4-3-2-1 grounding',
          body: 'When your mind is racing, come back to the room through your senses.',
        },
      ],
    },
    {
      id: 'toolkit',
      title: 'Your coping toolkit',
      minutes: 4,
      icon: 'umbrella',
      steps: [
        {
          id: 'my-toolkit',
          kind: 'toolkit',
          title: 'Build your toolkit',
          body: 'Save the ones you’d actually use. Different tools suit different moments.',
        },
        {
          id: 'toolkit-choice',
          kind: 'choice',
          question:
            'It’s 1am before an exam. Your heart is racing and you can’t sleep. What helps most right now?',
          options: [
            'Scroll your phone until you feel tired',
            'Box breathing, then lights off',
            'An energy drink and more reading',
          ],
          answer: 1,
          explanation:
            'Slow breathing calms your body enough to sleep, and sleep helps your memory more than late reading.',
        },
      ],
    },
    {
      id: 'crisis',
      title: 'Your crisis plan',
      minutes: 6,
      icon: 'shield',
      steps: [
        {
          id: 'crisis-intro',
          kind: 'info',
          art: 'shield',
          tone: 'lavender',
          title: 'A plan for the hardest moments',
          body: 'When things feel too much, it’s hard to think clearly. A plan made now, while you’re calm, tells you what to do.',
          bullets: [
            'Six short steps, in your own words',
            'It stays private. Your researcher only sees that you’ve made one',
            'You can open and change it any time from Support',
          ],
        },
        ...CRISIS_STEPS,
      ],
    },
  ],
  takeaways: [
    'Stress shows up in your body first, so notice the signs early',
    'Slow breathing and relaxing your muscles calm your body down',
    'A toolkit and a crisis plan mean you know what to do when it’s hard',
  ],
  practice: 'Use one tool from your toolkit each day, and log one stressful moment.',
  practiceAction: 'toolkit',
};
