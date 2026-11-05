import type { Call } from './caseload';
import { callState } from './todayLogic';

const DAY_MS = 24 * 60 * 60 * 1000;

export const CALL_MINUTES = 30;
export const BOOK_DAYS_AHEAD = 14;
// Covers the whole 8-week programme.
export const REPEAT_WEEKS = 8;

/** Minutes from midnight. */
export type DayHours = { on: boolean; start: number; end: number };

/** Keyed 0 (Sunday) to 6, as Date.getDay() counts. */
export type WeeklyHours = Record<number, DayHours>;

export const DEFAULT_HOURS: WeeklyHours = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((day) => [
    day,
    { on: day >= 1 && day <= 5, start: 9 * 60, end: 17 * 60 },
  ])
);

export function timeLabel(minutes: number): string {
  return new Date(2000, 0, 1, 0, minutes).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** e.g. "Mon–Fri · 9:00 AM–5:00 PM", "3 days · Varies". */
export function hoursSummary(hours: WeeklyHours): string {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const on = order.filter((d) => hours[d]?.on);
  if (on.length === 0) return 'Not available';
  const first = hours[on[0]];
  const same = on.every((d) => hours[d].start === first.start && hours[d].end === first.end);
  // 2 Jan 2000 was a Sunday.
  const name = (d: number) =>
    new Date(2000, 0, 2 + d).toLocaleDateString(undefined, { weekday: 'short' });
  const consecutive = on.every(
    (d, i) => i === 0 || order.indexOf(d) === order.indexOf(on[i - 1]) + 1
  );
  const days =
    on.length === 1
      ? name(on[0])
      : consecutive
        ? `${name(on[0])}–${name(on[on.length - 1])}`
        : `${on.length} days`;
  return same ? `${days} · ${timeLabel(first.start)}–${timeLabel(first.end)}` : `${days} · Varies`;
}

export type Booking = {
  id: string;
  studentId: string;
  startsAt: string;
  durationMin: number;
  weekly: boolean;
  note?: string;
};

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function expandBookings(bookings: Booking[]): Call[] {
  return bookings.flatMap((b) => {
    const count = b.weekly ? REPEAT_WEEKS : 1;
    return Array.from({ length: count }, (_, i) => {
      const start = new Date(b.startsAt);
      const startsAt = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i * 7,
        start.getHours(),
        start.getMinutes()
      ).toISOString();
      return {
        id: `${b.id}@${startsAt}`,
        studentId: b.studentId,
        startsAt,
        durationMin: b.durationMin,
        note: b.note,
        weekly: b.weekly,
      };
    });
  });
}

export function allCalls(existing: Call[], bookings: Booking[], cancelled: string[]): Call[] {
  const removed = new Set(cancelled);
  return [...existing, ...expandBookings(bookings)]
    .filter((c) => !removed.has(c.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function bookableDays(now = new Date(), hours: WeeklyHours = DEFAULT_HOURS): Date[] {
  const today = dayStart(now);
  return Array.from(
    { length: BOOK_DAYS_AHEAD },
    (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
  ).filter((d) => hours[d.getDay()]?.on);
}

export type Slot = { start: Date; taken: boolean };

/** A slot is taken if it overlaps a call; the call being moved doesn't block its own slot. */
export function slotsForDay(
  day: Date,
  calls: Call[],
  now = new Date(),
  ignoreCallId?: string,
  hours: WeeklyHours = DEFAULT_HOURS
): Slot[] {
  const slots: Slot[] = [];
  const today = hours[day.getDay()];
  if (!today?.on) return slots;
  for (let minutes = today.start; minutes + CALL_MINUTES <= today.end; minutes += CALL_MINUTES) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);
    if (start <= now) continue;
    const end = start.getTime() + CALL_MINUTES * 60_000;
    const taken = calls.some((c) => {
      if (c.id === ignoreCallId) return false;
      const cStart = new Date(c.startsAt).getTime();
      const cEnd = cStart + c.durationMin * 60_000;
      return cStart < end && start.getTime() < cEnd;
    });
    slots.push({ start, taken });
  }
  return slots;
}

export type CallDay = { date: Date; calls: Call[] };

export function upcomingByDay(calls: Call[], now = new Date(), days = BOOK_DAYS_AHEAD): CallDay[] {
  const last = dayStart(now).getTime() + days * DAY_MS;
  const groups = new Map<number, Call[]>();
  for (const call of calls) {
    const start = new Date(call.startsAt);
    if (callState(call, now) === 'done' || start.getTime() >= last) continue;
    const key = dayStart(start).getTime();
    groups.set(key, [...(groups.get(key) ?? []), call]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, list]) => ({
      date: new Date(key),
      calls: list.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    }));
}

export function dayLabel(date: Date, now = new Date()): string {
  const diff = Math.round((dayStart(date).getTime() - dayStart(now).getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
