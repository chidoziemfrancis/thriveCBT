import type { Href } from 'expo-router';

import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';
import type { SessionStep, StepAnswer } from '@/features/sessions/content/types';

/** Where stress shows up in the body, placed on the body figure as a share of its size. */
export const STRESS_SPOTS = [
  { id: 'head', label: 'Headache or tight jaw', x: 0.5, y: 0.12 },
  { id: 'shoulders', label: 'Tense neck and shoulders', x: 0.74, y: 0.28 },
  { id: 'chest', label: 'Racing heart, tight chest', x: 0.5, y: 0.38 },
  { id: 'stomach', label: 'Upset stomach', x: 0.5, y: 0.54 },
  { id: 'hands', label: 'Shaky or sweaty hands', x: 0.19, y: 0.55 },
  { id: 'legs', label: 'Restless legs', x: 0.6, y: 0.78 },
] as const;

export const NOT_IN_BODY = 'none';

export function spotLabels(ids: string[]) {
  return ids.flatMap((id) => {
    if (id === NOT_IN_BODY) return ['Not sure yet'];
    const spot = STRESS_SPOTS.find((s) => s.id === id);
    return spot ? [spot.label] : [];
  });
}

// What students in Nigerian universities most often name as stressful.
export const TRIGGERS = [
  'Exams and tests',
  'Money',
  'Family pressure',
  'Noise, no sleep',
  'Relationships',
  'No light or water',
  'Lecturers',
  'The future, jobs',
];

const SEP = '|';

export type Trigger = { label: string; level?: number };

export function writeTriggers(triggers: Trigger[]): string[] {
  return triggers.map((t) => `${t.label}${SEP}${t.level ?? ''}`);
}

export function readTriggers(answer: unknown): Trigger[] {
  if (!Array.isArray(answer)) return [];
  return (answer as string[]).map((item) => {
    const [label, level] = item.split(SEP);
    return { label, level: level === undefined || level === '' ? undefined : Number(level) };
  });
}

export type Exercise = 'box' | 'muscle' | 'grounding';

export const EXERCISES: { id: Exercise; title: string; detail: string; minutes: number }[] = [
  {
    id: 'box',
    title: 'Box breathing',
    detail: 'In, hold, out, hold, four counts each',
    minutes: 2,
  },
  {
    id: 'muscle',
    title: 'Muscle relaxation',
    detail: 'Tense and let go, one part of the body at a time',
    minutes: 3,
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 grounding',
    detail: 'Come back to the room through your senses',
    minutes: 3,
  },
];

export type CopingGroup = 'body' | 'mind' | 'reach';

export const COPING_GROUPS: { id: CopingGroup; label: string; tone: FeatureIconTone }[] = [
  { id: 'body', label: 'Calm the body', tone: 'mint' },
  { id: 'mind', label: 'Shift your attention', tone: 'butter' },
  { id: 'reach', label: 'Reach out', tone: 'lavender' },
];

export type CopingCard = {
  id: string;
  title: string;
  how: string;
  group: CopingGroup;
  icon: FeatureIconName;
  /** Where "Try it" goes, when the app can help with it. */
  href?: Href;
};

export const COPING_CARDS: CopingCard[] = [
  {
    id: 'box',
    title: 'Box breathing',
    how: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat four times.',
    group: 'body',
    icon: 'sun',
    href: '/relax/box',
  },
  {
    id: 'muscle',
    title: 'Muscle relaxation',
    how: 'Tense each part of your body for five seconds, then let it go.',
    group: 'body',
    icon: 'heart',
    href: '/relax/muscle',
  },
  {
    id: 'walk',
    title: 'Walk it off',
    how: 'A ten-minute walk, even round the hostel, burns off stress.',
    group: 'body',
    icon: 'shoe',
  },
  {
    id: 'water',
    title: 'Cool water',
    how: 'Splash cool water on your face or drink a glass slowly.',
    group: 'body',
    icon: 'umbrella',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 grounding',
    how: 'Name five things you see, four you feel, three you hear, two you smell, one you taste.',
    group: 'mind',
    icon: 'eye',
    href: '/relax/grounding',
  },
  {
    id: 'write',
    title: 'Write it down',
    how: 'Get the worry out of your head and onto paper for five minutes.',
    group: 'mind',
    icon: 'pencil',
    href: '/journal',
  },
  {
    id: 'music',
    title: 'Music break',
    how: 'Put on two songs you love and do nothing else.',
    group: 'mind',
    icon: 'music',
  },
  {
    id: 'pray',
    title: 'Pray or reflect',
    how: 'A few quiet minutes of prayer or reflection, if that’s part of your life.',
    group: 'mind',
    icon: 'church',
  },
  {
    id: 'friend',
    title: 'Talk to a friend',
    how: 'Tell someone you trust what’s going on. You don’t need a solution.',
    group: 'reach',
    icon: 'people',
  },
  {
    id: 'family',
    title: 'Call home',
    how: 'A short call with someone in your family.',
    group: 'reach',
    icon: 'phone',
  },
  {
    id: 'researcher',
    title: 'Message your researcher',
    how: 'Send your researcher a message in the app.',
    group: 'reach',
    icon: 'chat',
    href: '/chat',
  },
];

export function copingCard(id: string) {
  return COPING_CARDS.find((c) => c.id === id);
}

export type SafetySection = 'warning' | 'alone' | 'distract' | 'people' | 'pros' | 'safe';

export const SAFETY_SECTIONS: { id: SafetySection; title: string }[] = [
  { id: 'warning', title: 'My warning signs' },
  { id: 'alone', title: 'Things I can do on my own' },
  { id: 'distract', title: 'People and places that take my mind off it' },
  { id: 'people', title: 'People I can ask for help' },
  { id: 'pros', title: 'Professionals and helplines' },
  { id: 'safe', title: 'Making my space safer' },
];

export type CrisisPlan = Partial<Record<SafetySection, string[]>>;

/** A contact is saved as "name|phone". */
export function readContact(item: string) {
  const [name, phone] = item.split(SEP);
  return { name: name ?? '', phone: phone?.trim() || undefined };
}

export function writeContact(name: string, phone: string) {
  return phone.trim() ? `${name.trim()}${SEP}${phone.trim()}` : name.trim();
}

export function planFilled(plan: CrisisPlan | null | undefined) {
  return SAFETY_SECTIONS.filter((s) => (plan?.[s.id] ?? []).length > 0).length;
}

/** Helplines the study team will confirm; numbers are placeholders until then. */
export const HELPLINES: { name: string; phone?: string }[] = [
  { name: 'Campus counselling centre' },
  { name: 'Nigeria crisis helpline' },
  { name: 'Emergency services', phone: '112' },
];

/** The crisis plan from the safety steps in a part, or null if nothing was written. */
export function crisisPlanFrom(
  steps: SessionStep[],
  answers: Record<string, StepAnswer>
): CrisisPlan | null {
  const plan: CrisisPlan = {};
  for (const step of steps) {
    const answer = answers[step.id];
    if (step.kind !== 'safety' || !Array.isArray(answer)) continue;
    const items = (answer as string[]).map((i) => i.trim()).filter(Boolean);
    if (items.length > 0) plan[step.section] = items;
  }
  return planFilled(plan) > 0 ? plan : null;
}
