// Placeholder list until a clinician on the study team approves the real one. Matching is
// deliberately broad: a false alarm costs a researcher a quick check, a miss could cost far more.
export const RISK_PHRASES = [
  'kill myself',
  'killing myself',
  'end my life',
  'end it all',
  'want to die',
  'wanna die',
  'better off dead',
  'suicide',
  'suicidal',
  'hurt myself',
  'hurting myself',
  'self harm',
  'self-harm',
  'cut myself',
  'no reason to live',
];

function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsRiskLanguage(text: string): boolean {
  const normalised = ` ${normalise(text)} `;
  return RISK_PHRASES.some((phrase) => normalised.includes(` ${normalise(phrase)} `));
}
