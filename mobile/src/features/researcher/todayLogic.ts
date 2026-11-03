import { JOIN_EARLY_MIN } from '@/features/checkin/checkinLogic';

import type { Call, CaseloadStudent } from './caseload';

const DAY_MS = 24 * 60 * 60 * 1000;

// Draft thresholds until the study team confirms them.
export const INACTIVE_DAYS = 5;
export const SEVERE_PHQ9 = 20;

export type NeedsYou = { student: CaseloadStudent; reason: string; urgent: boolean };

/** Students who need attention today, urgent ones first. */
export function needsYou(students: CaseloadStudent[], now = new Date()): NeedsYou[] {
  const items: NeedsYou[] = [];
  for (const student of students) {
    if (student.phq9.item9 > 0) {
      items.push({ student, reason: 'Answered question 9 above zero', urgent: true });
      continue;
    }
    const quiet = Math.floor((now.getTime() - new Date(student.lastActiveAt).getTime()) / DAY_MS);
    if (quiet >= INACTIVE_DAYS) {
      items.push({ student, reason: `Not active for ${quiet} days`, urgent: false });
    } else if (student.phq9.score >= SEVERE_PHQ9) {
      items.push({ student, reason: `Severe PHQ-9 score (${student.phq9.score})`, urgent: false });
    }
  }
  return items.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

export type CallState = 'done' | 'live' | 'upcoming';

/** Live from 10 minutes before the start, the same window students get, until it ends. */
export function callState(call: Call, now = new Date()): CallState {
  const start = new Date(call.startsAt).getTime();
  const end = start + call.durationMin * 60_000;
  if (now.getTime() > end) return 'done';
  if (now.getTime() >= start - JOIN_EARLY_MIN * 60_000) return 'live';
  return 'upcoming';
}

/** Today's calls, earliest first. */
export function callsToday(calls: Call[], now = new Date()): Call[] {
  return calls
    .filter((c) => new Date(c.startsAt).toDateString() === now.toDateString())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** The call happening now, or else the next one today. */
export function nextCall(calls: Call[], now = new Date()): Call | null {
  return callsToday(calls, now).find((c) => callState(c, now) !== 'done') ?? null;
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
