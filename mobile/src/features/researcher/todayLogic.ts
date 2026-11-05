import { JOIN_EARLY_MIN } from '@/features/checkin/checkinLogic';

import type { Call, CaseloadStudent } from './caseload';

import { INACTIVE_DAYS, SEVERE_PHQ9, openAlerts } from './alerts';

export { INACTIVE_DAYS, SEVERE_PHQ9 };

export type NeedsYou = {
  student: CaseloadStudent;
  reason: string;
  urgent: boolean;
  alertId: string;
};

/**
 * Students who need attention today: each one's most serious open alert, urgent first. Alerts
 * the researcher has marked as handled no longer count.
 */
export function needsYou(
  students: CaseloadStudent[],
  now = new Date(),
  handled: string[] = []
): NeedsYou[] {
  const seen = new Set<string>();
  const items: NeedsYou[] = [];
  for (const alert of openAlerts(students, handled, now)) {
    if (seen.has(alert.student.id)) continue;
    seen.add(alert.student.id);
    items.push({
      student: alert.student,
      reason: alert.title,
      urgent: alert.urgent,
      alertId: alert.id,
    });
  }
  return items;
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
