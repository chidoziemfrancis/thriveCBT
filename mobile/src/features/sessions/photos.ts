export type PhotoKey =
  | 'hero'
  | 'welcome'
  | 'worry-studies'
  | 'worry-lonely'
  | 'worry-money'
  | 'worry-relationships'
  | 'worry-family'
  | 'better'
  | 'quiz-stress';

// Illustrations, not photos, so every student can see themselves in them. Bundled so sessions work
// offline and every student sees the same pictures. Credits in assets/images/sessions/CREDITS.md.
export const PHOTOS: Partial<Record<PhotoKey, number>> = {
  hero: require('@/assets/images/sessions/illustrations/hero.svg'),
  welcome: require('@/assets/images/sessions/illustrations/welcome.svg'),
  'worry-studies': require('@/assets/images/sessions/illustrations/worry-studies.svg'),
  'worry-lonely': require('@/assets/images/sessions/illustrations/worry-lonely.svg'),
  'worry-money': require('@/assets/images/sessions/illustrations/worry-money.svg'),
  'worry-relationships': require('@/assets/images/sessions/illustrations/worry-relationships.svg'),
  'worry-family': require('@/assets/images/sessions/illustrations/worry-family.svg'),
  better: require('@/assets/images/sessions/illustrations/better.svg'),
  'quiz-stress': require('@/assets/images/sessions/illustrations/quiz-stress.svg'),
};

/** What each photo shows, read out by screen readers. */
export const PHOTO_ALT: Record<PhotoKey, string> = {
  hero: 'A student outside a campus building on a sunny morning',
  welcome: 'Two students smiling together in the sun',
  'worry-studies': 'A tired student at a desk with books',
  'worry-lonely': 'A student alone by a window',
  'worry-money': 'A worried student next to a wallet with naira',
  'worry-relationships': 'A worried student and a phone showing a message left on seen',
  'worry-family': 'A parent speaking to a worried student',
  better: 'Three friends smiling together in the sun',
  'quiz-stress': 'A student reading calmly at a desk under a lamp',
};
