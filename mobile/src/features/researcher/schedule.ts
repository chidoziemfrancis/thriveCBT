import type { Call } from './caseload';
import { callState } from './todayLogic';

const DAY_MS = 24 * 60 * 60 * 1000;

export const CALL_MINUTES = 30;
/** How far ahead calls can be booked, and how far a weekly booking is shown. */
export const BOOK_DAYS_AHEAD = 14;
export const REPEAT_WEEKS = 8;

/**
 * Working hours that slots are offered in, until researchers set their own in Settings:
 * Monday to Friday, 9am to 5pm.
 */
export const AVAILABILITY = { days: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 };

/** A call the researcher has booked, as stored. A weekly booking repeats from its first call. */
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

/** Each booking as the calls it produces: one, or one a week for the repeat window. */
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

/** Every call: the existing ones plus booked ones, minus any that were cancelled. */
export function allCalls(existing: Call[], bookings: Booking[], cancelled: string[]): Call[] {
  const removed = new Set(cancelled);
  return [...existing, ...expandBookings(bookings)]
    .filter((c) => !removed.has(c.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** The days calls can be booked on: working days from today through the booking window. */
export function bookableDays(now = new Date()): Date[] {
  const today = dayStart(now);
  return Array.from(
    { length: BOOK_DAYS_AHEAD },
    (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
  ).filter((d) => AVAILABILITY.days.includes(d.getDay()));
}

export type Slot = { start: Date; taken: boolean };

/**
 * The half-hour slots in working hours on a day, skipping any that have already started.
 * A slot is taken when it overlaps another call, so nothing is ever double-booked. The call
 * being moved, if any, doesn't block its own old slot.
 */
export function slotsForDay(
  day: Date,
  calls: Call[],
  now = new Date(),
  ignoreCallId?: string
): Slot[] {
  const slots: Slot[] = [];
  for (
    let minutes = AVAILABILITY.startHour * 60;
    minutes < AVAILABILITY.endHour * 60;
    minutes += CALL_MINUTES
  ) {
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

/** Calls that aren't over yet, grouped by day for the next couple of weeks. */
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

/** "Today", "Tomorrow", or the weekday and date. */
export function dayLabel(date: Date, now = new Date()): string {
  const diff = Math.round((dayStart(date).getTime() - dayStart(now).getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
