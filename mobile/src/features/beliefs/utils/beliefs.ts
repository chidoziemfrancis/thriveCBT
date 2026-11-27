import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';

export const CORE_BELIEFS = [
  'I’m not good enough',
  'I’m a failure',
  'I’m unlovable',
  'I’m worthless',
  'I’m stupid',
  'I don’t belong',
];

/** A kinder, believable version of each common core belief. */
export const NEW_BELIEFS = [
  'I’m good enough as I am, and still growing',
  'I’m someone who’s still learning',
  'I’m worth caring about',
  'I have things to offer',
  'I can learn hard things with time',
  'I belong here as much as anyone',
];

const WHY = 'why:';
const BELIEF = 'belief:';

/** The downward arrow: a thought, the answers that went deeper, and the belief at the root. */
export function readArrow(answer: unknown) {
  const items = Array.isArray(answer) ? (answer as string[]) : [];
  const belief = items.find((i) => i.startsWith(BELIEF));
  return {
    thought: (items[0] ?? '').trim(),
    levels: items.filter((i) => i.startsWith(WHY)).map((i) => i.slice(WHY.length)),
    belief: belief ? belief.slice(BELIEF.length).trim() : '',
  };
}

export function writeArrow(thought: string, levels: string[], belief?: string): string[] {
  return [thought, ...levels.map((l) => WHY + l), ...(belief ? [BELIEF + belief] : [])];
}

export type PositiveKind = 'strength' | 'win' | 'kind' | 'other';

export const POSITIVE_KINDS: {
  id: PositiveKind;
  label: string;
  icon: FeatureIconName;
  tone: FeatureIconTone;
}[] = [
  { id: 'strength', label: 'A strength', icon: 'trophy', tone: 'butter' },
  { id: 'win', label: 'A win', icon: 'flag', tone: 'mint' },
  { id: 'kind', label: 'Something kind', icon: 'heart', tone: 'peach' },
  { id: 'other', label: 'Other evidence', icon: 'checkCircle', tone: 'lavender' },
];

export function positiveKind(id: PositiveKind) {
  return POSITIVE_KINDS.find((k) => k.id === id) ?? POSITIVE_KINDS[3];
}

export type PositiveEntry = {
  id: string;
  at: string;
  kind: PositiveKind;
  text: string;
  /** When the phone last changed it; the newest change wins when syncing. */
  updatedAt?: string;
};
