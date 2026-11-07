import { SESSIONS } from '@/features/sessions/sessions';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Week 1 starts on the day the student joined; it never goes past the last session's week. */
export function weekOfStudy(startIso: string | undefined, now = new Date()): number {
  const start = startIso ? new Date(startIso) : now;
  if (Number.isNaN(start.getTime())) return 1;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const week = Math.floor((today - startDay) / (7 * DAY_MS)) + 1;
  return Math.min(Math.max(week, 1), SESSIONS.length);
}

/** Each session opens on the same weekday the student joined, one week apart. */
export function sessionOpensOn(startIso: string | undefined, sessionId: number, now = new Date()) {
  const parsed = startIso ? new Date(startIso) : now;
  const start = Number.isNaN(parsed.getTime()) ? now : parsed;
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + (sessionId - 1) * 7);
}

export function opensLabel(opensOn: Date, now = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((opensOn.getTime() - today) / DAY_MS);
  if (days <= 0) return 'Opens today';
  if (days === 1) return 'Opens tomorrow';
  return `Opens ${opensOn.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
}
