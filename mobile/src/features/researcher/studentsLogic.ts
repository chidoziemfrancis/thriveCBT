import { moodOnDay } from '@/features/mood/moodLog';

import type { Call, CaseloadStudent } from './caseload';
import { callState, needsYou } from './todayLogic';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_MOOD_DAYS = 7;

/** Quiet before it's long enough to raise a "needs you" alert. */
export const QUIET_DAYS = 3;

export type StudentFilter = 'all' | 'needs' | 'quiet';

export function quietDays(student: CaseloadStudent, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(student.lastActiveAt).getTime()) / DAY_MS);
}

/**
 * The list for a filter and search, with anyone who needs the researcher at the top and
 * everyone else alphabetical.
 */
export function filterStudents(
  students: CaseloadStudent[],
  filter: StudentFilter,
  query: string,
  now = new Date()
): CaseloadStudent[] {
  const flagged = new Set(needsYou(students, now).map((n) => n.student.id));
  const search = query.trim().toLowerCase();
  return students
    .filter((s) => filter !== 'needs' || flagged.has(s.id))
    .filter((s) => filter !== 'quiet' || quietDays(s, now) >= QUIET_DAYS)
    .filter((s) => !search || s.name.toLowerCase().includes(search))
    .sort(
      (a, b) =>
        Number(flagged.has(b.id)) - Number(flagged.has(a.id)) || a.name.localeCompare(b.name)
    );
}

export type RowMark =
  | { kind: 'urgent' }
  | { kind: 'quiet'; days: number }
  | { kind: 'mood'; mood: number }
  | { kind: 'none' };

/** The single thing shown on the right of a student's row, most important first. */
export function rowMark(student: CaseloadStudent, now = new Date()): RowMark {
  if (student.phq9.item9 > 0) return { kind: 'urgent' };
  const days = quietDays(student, now);
  if (days >= QUIET_DAYS) return { kind: 'quiet', days };
  for (let back = 0; back < RECENT_MOOD_DAYS; back++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
    const entry = moodOnDay(student.moods, day);
    if (entry) return { kind: 'mood', mood: entry.mood };
  }
  return { kind: 'none' };
}

/** "active now", "active 2h ago", "active 3 days ago". */
export function activeLabel(iso: string, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return 'active now';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `active ${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/** The student's next call that hasn't finished yet, or null. */
export function nextCallFor(studentId: string, calls: Call[], now = new Date()): Call | null {
  return (
    calls
      .filter((c) => c.studentId === studentId && callState(c, now) !== 'done')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null
  );
}
