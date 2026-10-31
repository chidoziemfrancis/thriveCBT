// Draft prompts drawn from the session topics, pending sign-off by the study team. They stay
// gentle and open, and none asks the student to relive anything painful in detail.
export const PROMPTS_ARE_DRAFT = true;

export const JOURNAL_PROMPTS = [
  'What’s one thing that went better than you expected this week?',
  'What’s been on your mind most today?',
  'Describe a moment today when you felt even a little bit calm.',
  'What’s a thought that kept coming back today? How true does it feel now?',
  'What’s something small you did for yourself recently?',
  'Who made your day a little easier lately, and how?',
  'What would you say to a friend who was feeling the way you feel today?',
  'What’s one thing you’re looking forward to, however small?',
  'When did you feel most like yourself this week?',
  'What’s been weighing on you, and what’s one tiny step that might help?',
  'What’s something you handled well, even if it was hard?',
  'What did you notice about your mood today? Did anything shift it?',
  'Write about something that made you smile or laugh recently.',
  'What do you need more of this week? What do you need less of?',
  'What’s one kind thing you can tell yourself right now?',
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** The same prompt all day, changing at local midnight, so it feels like "today's" question. */
export function promptIndexForDay(date = new Date()): number {
  const localDay = Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / DAY_MS);
  return localDay % JOURNAL_PROMPTS.length;
}
