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

/** Blank cells before day 1 in a Monday-first calendar grid. */
export function leadingBlanks(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function isFutureDate(year: number, month: number, day: number, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(year, month, day) > today;
}

/** Drops the day when a new year or month makes it impossible, e.g. 31 after picking April. */
export function withValidDay(parts: DateParts): DateParts {
  const { year, month, day } = parts;
  if (year === undefined || month === undefined || day === undefined) return parts;
  return day > daysInMonth(year, month) ? { year, month } : parts;
}
