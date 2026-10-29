export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export type DateParts = { year?: number; month?: number; day?: number };

export function calculateAge(birth: Date, now = new Date()): number {
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// `new Date('2005-01-15')` parses as UTC midnight, which lands on the previous day west of
// Greenwich, so stored birthdays are split into local parts instead.
export function parseIsoDate(iso: string | undefined): DateParts {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return {};
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Rolls a day back to the month's last day when it no longer exists, e.g. 31 in April. */
export function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

export const OLDEST_BIRTH_AGE = 80;
export const YOUNGEST_BIRTH_AGE = 10;

// Bounded at both ends so the wheel stays short and can never land on a future date.
export function birthYears(now = new Date()): number[] {
  const latest = now.getFullYear() - YOUNGEST_BIRTH_AGE;
  const earliest = now.getFullYear() - OLDEST_BIRTH_AGE;
  return Array.from({ length: latest - earliest + 1 }, (_, i) => earliest + i);
}
