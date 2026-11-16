import { SKILLS, WELL_IDS } from '@/features/wellbeing/wellbeing';

import type { SessionContent } from './types';

// Session 8, "Relapse Prevention & Future Planning", from the study's CBT intervention
// structure. Wording should be reviewed by the research team.
export const SESSION_8: SessionContent = {
  sessionId: 8,
  hero: 'week8',
  finale: true,
  modules: [
    {
      id: 'journey',
      title: 'Look how far you’ve come',
      minutes: 4,
      icon: 'trophy',
      steps: [
        {
          id: 'welcome',
          kind: 'info',
          photo: 'week8',
          title: 'Welcome to week 8, {name}',
          body: 'The last session. Today is about looking back at what you’ve built, and making a plan to keep it going.',
          researcherNote: true,
        },
        {
          id: 'journey',
          kind: 'journey',
          title: 'Your eight weeks',
          body: 'Here’s what you did, in your own numbers.',
        },
        {
          id: 'top-skills',
          kind: 'checklist',
          title: 'Which skills helped you most?',
          body: 'Pick up to three. They’ll go into your plan.',
          options: SKILLS,
          responseSome:
            'Those are yours to keep. They work best when you use them before things get bad.',
          responseNone: 'That’s okay. Your plan can still use what you’ve learned.',
        },
      ],
    },
    {
      id: 'signs',
      title: 'Spot the signs early',
      minutes: 6,
      icon: 'eye',
      steps: [
        {
          id: 'lapse-myth',
          kind: 'mythFact',
          statement: 'One bad week means I’m back to square one.',
          isFact: false,
          explanation:
            'A lapse is a dip, not a fall back to the start. Everything you’ve learned is still there, and spotting it early makes it shorter.',
        },
        {
          id: WELL_IDS.triggers,
          kind: 'list',
          section: 'triggers',
          title: 'What could set you back?',
          hint: 'Situations that might bring low mood back, like exams or a breakup.',
          suggestions: ['Exam season', 'Being away from home', 'Money running out'],
        },
        {
          id: WELL_IDS.signs,
          kind: 'list',
          section: 'signs',
          title: 'What would you notice first?',
          hint: 'The early signs that you’re starting to slip.',
          suggestions: [
            'Skipping lectures',
            'Sleeping badly',
            'Avoiding friends',
            'Harsh thoughts',
          ],
        },
        {
          id: WELL_IDS.actions,
          kind: 'list',
          section: 'actions',
          title: 'What will you do?',
          hint: 'The skills and tools you’ll reach for.',
          skillsFrom: 'top-skills',
        },
        {
          id: WELL_IDS.people,
          kind: 'list',
          section: 'people',
          title: 'Who will you tell?',
          hint: 'People who can notice with you and help.',
          suggestions: ['My campus counsellor', 'A close friend'],
        },
      ],
    },
    {
      id: 'ahead',
      title: 'Looking ahead',
      minutes: 5,
      icon: 'flag',
      steps: [
        {
          id: WELL_IDS.goal,
          kind: 'goal',
          title: 'One goal for the next three months',
          body: 'Something that matters to you. Keep the steps small.',
        },
      ],
    },
    {
      id: 'note',
      title: 'A note for a hard day',
      minutes: 4,
      icon: 'pencil',
      steps: [
        {
          id: WELL_IDS.note,
          kind: 'prompt',
          title: 'Write to the future you',
          hint: 'For a day when things feel heavy again. What do you want to remember?',
          starters: [
            'You’ve got through hard weeks before.',
            'Remember to',
            'Be gentle with yourself.',
          ],
        },
        {
          id: 'well-recap',
          kind: 'recap',
          of: 'wellbeing',
          title: 'Your staying-well plan',
          body: 'Saved on the Support screen. Open it whenever you notice your warning signs.',
        },
      ],
    },
  ],
  takeaways: [
    'A lapse is a dip, not a return to the start',
    'Spotting your warning signs early makes a dip shorter',
    'Your skills keep working when you keep using them',
  ],
  practice: 'Keep using the skills that help you, and open your plan if things start to slip.',
  practiceAction: 'wellbeing',
};
