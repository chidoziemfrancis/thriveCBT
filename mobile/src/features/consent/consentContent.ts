// All participant-facing study wording lives here so the ethics-approved text can replace it
// in one place. While CONSENT_IS_DRAFT is true the screens show a "Draft" tag, so unapproved
// wording can't reach participants unnoticed.
export const CONSENT_IS_DRAFT = true;

// Stored with each agreement, so the study can tell which wording a participant agreed to.
export const CONSENT_VERSION = 'draft-2026-10-29';

export const STUDY_INFO = [
  {
    title: 'What is this study?',
    body: 'A research study testing whether an 8-week digital CBT programme helps undergraduate students who are feeling low or depressed.',
  },
  {
    title: 'What will I do?',
    body: 'Answer a short check-in now and at the end, complete one session a week for 8 weeks (about 35–50 minutes each, plus small daily practice), and have a weekly check-in with your researcher.',
  },
  {
    title: 'Who sees my answers?',
    body: 'Only the research team. Your answers are stored securely, reported without your name, and never shared with your school or anyone else.',
  },
  {
    title: 'Are there any risks?',
    body: 'Some questions ask about difficult feelings. If your answers suggest you may be at risk, your researcher will reach out, and support contacts are always one tap away in the app.',
  },
  {
    title: 'Can I stop?',
    body: 'Yes. Taking part is voluntary. You can withdraw at any time from your profile, without giving a reason.',
  },
];

export const CONSENT_STATEMENTS = [
  'I have read the study information and had the chance to ask questions.',
  'I understand that taking part is voluntary and I can withdraw at any time.',
  'I agree to my answers being used for this research, as described.',
  'I understand my researcher will contact me weekly, and sooner if my answers suggest I may be at risk.',
];
