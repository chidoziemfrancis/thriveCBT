// The Eysenck Personality Questionnaire, Revised: 100 yes/no questions about how a person
// usually is, scored on four scales. Questions and scoring key from the study team, who confirmed
// permission to use it. Taken once, at the start, alongside the PHQ-9.

export const EPQR_ITEMS = [
  'Do you have many different hobbies?',
  'Do you stop to think things over before doing anything?',
  'Does your mood often go up and down?',
  'Have you ever taken the praise for something you knew someone else had really done?',
  'Do you take much notice of what people think?',
  'Are you a talkative person?',
  'Would being in debt worry you?',
  'Do you ever feel ‘just miserable’ for no reason?',
  'Do you give money to charities?',
  'Were you ever greedy by helping yourself to more than your share of anything?',
  'Are you rather lively?',
  'Would it upset you a lot to see a child or an animal suffer?',
  'Do you often worry about things you should not have done or said?',
  'Do you dislike people who don’t know how to behave themselves?',
  'If you say you will do something, do you always keep your promise no matter how inconvenient it might be?',
  'Can you usually let yourself go and enjoy yourself at a lively party?',
  'Are you an irritable person?',
  'Should people always respect the law?',
  'Have you ever blamed someone for doing something you knew was really your fault?',
  'Do you enjoy meeting new people?',
  'Are good manners very important?',
  'Are your feelings easily hurt?',
  'Are all your habits good and desirable ones?',
  'Do you tend to keep in the background on social occasions?',
  'Would you take drugs which may have strange or dangerous effects?',
  'Do you often feel ‘fed-up’?',
  'Have you ever taken anything (even a pin or button) that belonged to someone else?',
  'Do you like going out a lot?',
  'Do you prefer to go your own way rather than act by the rules?',
  'Do you enjoy hurting people you love?',
  'Are you often troubled about feelings of guilt?',
  'Do you sometimes talk about things you know nothing about?',
  'Do you prefer reading to meeting people?',
  'Do you have enemies who want to harm you?',
  'Would you call yourself a nervous person?',
  'Do you have many friends?',
  'Do you enjoy practical jokes that can sometimes really hurt people?',
  'Are you a worrier?',
  'As a child did you do as you were told immediately and without grumbling?',
  'Would you call yourself happy-go-lucky?',
  'Do good manners and cleanliness matter much to you?',
  'Have you often gone against your parents’ wishes?',
  'Do you worry about awful things that might happen?',
  'Have you ever broken or lost something belonging to someone else?',
  'Do you usually take the initiative in making new friends?',
  'Would you call yourself tense or ‘highly-strung’?',
  'Are you mostly quiet when you are with other people?',
  'Do you think marriage is old-fashioned and should be done away with?',
  'Do you sometimes boast a little?',
  'Are you more easy-going about right and wrong than most people?',
  'Can you easily get some life into a rather dull party?',
  'Do you worry about your health?',
  'Have you ever said anything bad or nasty about anyone?',
  'Do you enjoy co-operating with others?',
  'Do you like telling jokes and funny stories to your friends?',
  'Do most things taste the same to you?',
  'As a child were you ever cheeky to your parents?',
  'Do you like mixing with people?',
  'Does it worry you if you know there are mistakes in your work?',
  'Do you suffer from sleeplessness?',
  'Have people said that you sometimes act too rashly?',
  'Do you always wash before a meal?',
  'Do you nearly always have a ‘ready answer’ when people talk to you?',
  'Do you like to arrive at appointments in plenty of time?',
  'Have you often felt listless and tired for no reason?',
  'Have you ever cheated at a game?',
  'Do you like doing things in which you have to act quickly?',
  'Is (or was) your mother a good woman?',
  'Do you often make decisions on the spur of the moment?',
  'Do you often feel life is very dull?',
  'Have you ever taken advantage of someone?',
  'Do you often take on more activities than you have time for?',
  'Are there several people who keep trying to avoid you?',
  'Do you worry a lot about your looks?',
  'Do you think people spend too much time safeguarding their future with savings and insurance?',
  'Have you ever wished that you were dead?',
  'Would you dodge paying taxes if you were sure you could never be found out?',
  'Can you get a party going?',
  'Do you try not to be rude to people?',
  'Do you worry too long after an embarrassing experience?',
  'Do you generally ‘look before you leap’?',
  'Have you ever insisted on having your own way?',
  'Do you suffer from ‘nerves’?',
  'Do you often feel lonely?',
  'Can you on the whole trust people to tell the truth?',
  'Do you always practice what you preach?',
  'Are you easily hurt when people find fault with you or the work you do?',
  'Is it better to follow society’s rules than go your own way?',
  'Have you ever been late for an appointment or work?',
  'Do you like plenty of bustle and excitement around you?',
  'Would you like other people to be afraid of you?',
  'Are you sometimes bubbling over with energy and sometimes very sluggish?',
  'Do you sometimes put off until tomorrow what you ought to do today?',
  'Do other people think of you as being very lively?',
  'Do people tell you a lot of lies?',
  'Do you believe one has special duties to one’s family?',
  'Are you touchy about some things?',
  'Are you always willing to admit it when you have made a mistake?',
  'Would you feel very sorry for an animal caught in a trap?',
  'When your temper rises, do you find it difficult to control?',
];

export type EpqrScale = 'P' | 'E' | 'N' | 'L';

/** Item numbers (1 to 100) that score a point when answered Yes, or when answered No. */
export const EPQR_KEY: Record<EpqrScale, { yes: number[]; no: number[] }> = {
  P: {
    yes: [25, 29, 30, 34, 37, 42, 48, 50, 56, 73, 75, 91, 95],
    no: [2, 5, 7, 9, 12, 14, 18, 21, 41, 54, 59, 64, 68, 79, 81, 85, 88, 96, 99],
  },
  E: {
    yes: [1, 6, 11, 16, 20, 28, 36, 40, 45, 51, 55, 58, 61, 63, 67, 69, 72, 78, 90, 94],
    no: [24, 33, 47],
  },
  N: {
    yes: [
      3, 8, 13, 17, 22, 26, 31, 35, 38, 43, 46, 52, 60, 65, 70, 74, 76, 80, 83, 84, 87, 92, 97, 100,
    ],
    no: [],
  },
  L: {
    yes: [15, 23, 39, 62, 86, 98],
    no: [4, 10, 19, 27, 32, 44, 49, 53, 57, 66, 71, 77, 82, 89, 93],
  },
};

/** In plain words, for researchers reading the scores. */
export const EPQR_SCALES: { id: EpqrScale; name: string; meaning: string }[] = [
  {
    id: 'E',
    name: 'Extraversion',
    meaning: 'How outgoing and sociable. High: lively, enjoys people. Low: quiet, reserved.',
  },
  {
    id: 'N',
    name: 'Neuroticism',
    meaning: 'How much they worry and how easily their mood shifts. High: anxious, easily hurt.',
  },
  {
    id: 'P',
    name: 'Psychoticism',
    meaning: 'How tough-minded and rule-breaking. High: goes own way, less concerned for others.',
  },
  {
    id: 'L',
    name: 'Lie',
    meaning: 'Whether answers lean towards looking good. High: may be answering to please.',
  },
];

/** "Have you ever wished that you were dead?" A Yes is treated as a warning sign. */
export const WISHED_DEAD_INDEX = 75;

export const EPQR_BREAKS = [25, 50, 75];

/** The most points each scale can score. */
export function epqrMax(scale: EpqrScale) {
  return EPQR_KEY[scale].yes.length + EPQR_KEY[scale].no.length;
}

/** Points per scale; unanswered questions score nothing. */
export function epqrScores(answers: (boolean | undefined)[]): Record<EpqrScale, number> {
  const score = (scale: EpqrScale) =>
    EPQR_KEY[scale].yes.filter((n) => answers[n - 1] === true).length +
    EPQR_KEY[scale].no.filter((n) => answers[n - 1] === false).length;
  return { P: score('P'), E: score('E'), N: score('N'), L: score('L') };
}

/** The four scores on one line, e.g. "E 12 · N 18 · P 6 · L 9". */
export function epqrSummary(answers: (boolean | undefined)[]) {
  const s = epqrScores(answers);
  return `E ${s.E} · N ${s.N} · P ${s.P} · L ${s.L}`;
}
