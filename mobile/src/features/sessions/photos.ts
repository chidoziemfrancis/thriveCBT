export type PhotoKey =
  | 'hero'
  | 'welcome'
  | 'worry-studies'
  | 'worry-lonely'
  | 'worry-money'
  | 'worry-relationships'
  | 'worry-family'
  | 'better'
  | 'quiz-stress'
  | 'week2'
  | 'tobi-test'
  | 'thoughts'
  | 'scenario-exam'
  | 'scenario-seen'
  | 'scenario-scroll'
  | 'feel-sad'
  | 'feel-anxious'
  | 'feel-angry'
  | 'feel-ashamed'
  | 'feel-lonely'
  | 'feel-numb'
  | 'week3'
  | 'trap-catastrophe'
  | 'trap-mindreading'
  | 'trap-always'
  | 'trap-allornothing';

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
  week2: require('@/assets/images/sessions/illustrations/week2.svg'),
  'tobi-test': require('@/assets/images/sessions/illustrations/tobi-test.svg'),
  thoughts: require('@/assets/images/sessions/illustrations/thoughts.svg'),
  'scenario-exam': require('@/assets/images/sessions/illustrations/scenario-exam.svg'),
  'scenario-seen': require('@/assets/images/sessions/illustrations/scenario-seen.svg'),
  'scenario-scroll': require('@/assets/images/sessions/illustrations/scenario-scroll.svg'),
  'feel-sad': require('@/assets/images/sessions/illustrations/feel-sad.svg'),
  'feel-anxious': require('@/assets/images/sessions/illustrations/feel-anxious.svg'),
  'feel-angry': require('@/assets/images/sessions/illustrations/feel-angry.svg'),
  'feel-ashamed': require('@/assets/images/sessions/illustrations/feel-ashamed.svg'),
  'feel-lonely': require('@/assets/images/sessions/illustrations/feel-lonely.svg'),
  'feel-numb': require('@/assets/images/sessions/illustrations/feel-numb.svg'),
  week3: require('@/assets/images/sessions/illustrations/week3.svg'),
  'trap-catastrophe': require('@/assets/images/sessions/illustrations/trap-catastrophe.svg'),
  'trap-mindreading': require('@/assets/images/sessions/illustrations/trap-mindreading.svg'),
  'trap-always': require('@/assets/images/sessions/illustrations/trap-always.svg'),
  'trap-allornothing': require('@/assets/images/sessions/illustrations/trap-allornothing.svg'),
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
  week2: 'Two students chatting on campus',
  'tobi-test': 'Tobi looking worried at a test marked 38%',
  thoughts: 'A student calmly asking a thought bubble: is it true?',
  'scenario-exam': 'A student looking down at a failed test',
  'scenario-seen': 'A worried student next to a phone showing a message left on seen',
  'scenario-scroll': 'A student frowning at a phone full of other people’s photos',
  'feel-sad': 'A sad face',
  'feel-anxious': 'An anxious face',
  'feel-angry': 'An angry face',
  'feel-ashamed': 'An ashamed face',
  'feel-lonely': 'A lonely face',
  'feel-numb': 'A numb, blank face',
  week3: 'A student next to a page with a magnifying glass',
  'trap-catastrophe': 'A worried student watching a snowball grow as it rolls downhill',
  'trap-mindreading': 'A worried student guessing what a friend is thinking',
  'trap-always': 'A tired student next to stamps reading always and never',
  'trap-allornothing': 'A serious student next to a circle split into black and white',
};
