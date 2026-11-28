import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';
import { toIsoDate } from '@/lib/dates';
import { contentUuid } from '@/lib/sync';

export type ActivityGroup = 'enjoy' | 'achieve' | 'connect';

export type Slot = 'morning' | 'afternoon' | 'evening';

export const SLOTS: { id: Slot; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

export const GROUPS: { id: ActivityGroup; label: string; hint: string; tone: FeatureIconTone }[] = [
  { id: 'enjoy', label: 'Enjoyment', hint: 'Something you like doing', tone: 'butter' },
  { id: 'achieve', label: 'Achievement', hint: 'Getting something done', tone: 'mint' },
  { id: 'connect', label: 'Connection', hint: 'Time with people', tone: 'lavender' },
];

export type Activity = { label: string; group: ActivityGroup; icon: FeatureIconName };

// Everyday things a Nigerian undergraduate can do on or near campus, most of them free.
export const ACTIVITIES: Activity[] = [
  { label: 'Cook or eat with friends', group: 'enjoy', icon: 'pot' },
  { label: 'Listen to music I love', group: 'enjoy', icon: 'music' },
  { label: 'Play or watch football', group: 'enjoy', icon: 'ball' },
  { label: 'Take a walk on campus', group: 'enjoy', icon: 'shoe' },
  { label: 'Wash my clothes', group: 'achieve', icon: 'shirt' },
  { label: 'Read for 20 minutes', group: 'achieve', icon: 'book' },
  { label: 'Tidy my room', group: 'achieve', icon: 'home' },
  { label: 'Go to one lecture', group: 'achieve', icon: 'document' },
  { label: 'Call someone at home', group: 'connect', icon: 'phone' },
  { label: 'Go to choir or fellowship', group: 'connect', icon: 'church' },
  { label: 'Visit a coursemate', group: 'connect', icon: 'people' },
  { label: 'Reply to a friend', group: 'connect', icon: 'chat' },
];

export function activityIcon(label: string): FeatureIconName {
  return ACTIVITIES.find((a) => a.label === label)?.icon ?? 'heart';
}

const SEP = '|';

/** How much an activity gives, 0 to 10 each. */
export type Rating = { label: string; enjoy?: number; achieve?: number };

export function writeRatings(ratings: Rating[]): string[] {
  return ratings.map((r) => [r.label, r.enjoy ?? '', r.achieve ?? ''].join(SEP));
}

export function readRatings(answer: unknown): Rating[] {
  if (!Array.isArray(answer)) return [];
  return (answer as string[]).map((item) => {
    const [label, enjoy, achieve] = item.split(SEP);
    const score = (v: string | undefined) => (v === undefined || v === '' ? undefined : Number(v));
    return { label, enjoy: score(enjoy), achieve: score(achieve) };
  });
}

/** One planned activity inside a session answer, before it reaches the week planner. */
export type PlanItem = { date: string; slot: Slot; label: string; predicted?: number };

export function writePlan(items: PlanItem[]): string[] {
  return items.map((p) => [p.date, p.slot, p.label, p.predicted ?? ''].join(SEP));
}

export function readPlan(answer: unknown): PlanItem[] {
  if (!Array.isArray(answer)) return [];
  return (answer as string[]).flatMap((item) => {
    const [date, slot, label, predicted] = item.split(SEP);
    if (!date || !label || !SLOTS.some((s) => s.id === slot)) return [];
    return [
      {
        date,
        slot: slot as Slot,
        label,
        predicted: predicted ? Number(predicted) : undefined,
      },
    ];
  });
}

/** The same plan always gets the same id, so saving a part twice doesn't double it. */
/**
 * A plan's id comes from its day, slot and activity, so the same plan made twice (in Session 5
 * and again in My week, or on two phones) is one plan, not two. It's shaped as a UUID (version
 * 8, for ids made this way) because the server stores ids as UUIDs. Ids only need to be
 * unique within one student; the server keys plans by student and id.
 */
export function planId({ date, slot, label }: PlanItem) {
  return contentUuid(`plan|${date}|${slot}|${label.trim().toLowerCase()}`);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Seven days from today, for planning the week ahead. */
export function nextSevenDays(today = new Date()): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
}

/** Monday to Sunday of the week `offset` weeks from this one. */
export function weekDays(today = new Date(), offset = 0): Date[] {
  const monday = addDays(today, -((today.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export const dayKey = toIsoDate;

export function dayName(date: Date, today = new Date()) {
  if (dayKey(date) === dayKey(today)) return 'Today';
  if (dayKey(date) === dayKey(addDays(today, 1))) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

export function shortDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3);
}

export type PlannedActivity = PlanItem & {
  id: string;
  sessionId?: number;
  doneAt?: string;
  /** How it actually felt, 0 to 10, rated when ticked off. */
  enjoy?: number;
  achieve?: number;
  /** When the phone last changed it; the newest change wins when syncing. */
  updatedAt?: string;
};

export function toPlanned(item: PlanItem, sessionId?: number): PlannedActivity {
  return { ...item, id: planId(item), ...(sessionId ? { sessionId } : {}) };
}

/** What the student guessed against how it felt, over every activity rated both ways. */
export function predictionGap(plans: PlannedActivity[]) {
  const rated = plans.filter((p) => p.doneAt && p.predicted !== undefined && p.enjoy !== undefined);
  if (rated.length === 0) return null;
  const average = (values: number[]) =>
    Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  return {
    count: rated.length,
    expected: average(rated.map((p) => p.predicted!)),
    actual: average(rated.map((p) => p.enjoy!)),
  };
}
