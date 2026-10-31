export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself, or that you are a failure, or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed, or the opposite, being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

export const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const SUICIDAL_IDEATION_INDEX = PHQ9_QUESTIONS.length - 1;

export function severityBand(score: number) {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately severe';
  return 'Severe';
}

/** Unanswered questions count as 0, so a partly filled questionnaire never scores NaN. */
export function phq9Score(answers: (number | undefined)[]): number {
  return answers.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}
