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
