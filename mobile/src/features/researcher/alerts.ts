import {
  EPQR_ITEMS,
  WISHED_DEAD_INDEX,
  PHQ9_OPTIONS,
  PHQ9_QUESTIONS,
  SUICIDAL_IDEATION_INDEX,
} from '@/features/assessment';

import type { AlertEvent } from './alertStore';
import type { CaseloadStudent, Phq9Taken } from './caseload';

const DAY_MS = 24 * 60 * 60 * 1000;

// Draft thresholds until the study team confirms them.
export const INACTIVE_DAYS = 5;
export const SEVERE_PHQ9 = 20;
/** The usual line for a real change on the PHQ-9. */
export const PHQ9_RISE = 5;

export type AlertKind = 'question9' | 'epqrWish' | 'riskWords' | 'phq9Rise' | 'severe' | 'inactive';

/** Something a researcher must act on, raised from a student's answers, messages or activity. */
export type StudentAlert = {
  /** Stable for the same event, so a handled alert stays handled when data is reloaded. */
  id: string;
  kind: AlertKind;
  student: CaseloadStudent;
  urgent: boolean;
  title: string;
  /** What triggered it, in the student's own words where there are any. */
  quote?: string;
  detail?: string;
  at: string;
  /** Set when the alert comes from the week-8 PHQ-9 rather than the one at sign-up. */
  final?: boolean;
};

function phq9Alerts(student: CaseloadStudent, taken: Phq9Taken, final: boolean): StudentAlert[] {
  const alerts: StudentAlert[] = [];
  const which = final ? 'final PHQ-9' : 'PHQ-9';
  if (taken.item9 > 0) {
    alerts.push({
      id: `${student.id}:question9:${taken.at}`,
      kind: 'question9',
      student,
      urgent: true,
      title: final
        ? 'Answered question 9 above zero on the final PHQ-9'
        : 'Answered question 9 above zero',
      quote: PHQ9_QUESTIONS[SUICIDAL_IDEATION_INDEX],
      detail: `Answer: ${PHQ9_OPTIONS.find((o) => o.value === taken.item9)?.label ?? taken.item9}`,
      at: taken.at,
      final,
    });
  }
  if (taken.score >= SEVERE_PHQ9) {
    alerts.push({
      id: `${student.id}:severe:${taken.at}`,
      kind: 'severe',
      student,
      urgent: false,
      title: `Severe ${which} score (${taken.score})`,
      detail: `${taken.score} of 27`,
      at: taken.at,
      final,
    });
  }
  return alerts;
}

/** Every alert a student has raised, most serious kind first. */
export function studentAlerts(student: CaseloadStudent, now = new Date()): StudentAlert[] {
  const alerts: StudentAlert[] = [];
  const { phq9, phq9Final } = student;
  const start = phq9Alerts(student, phq9, false);
  const end = phq9Final ? phq9Alerts(student, phq9Final, true) : [];
  const isQ9 = (a: StudentAlert) => a.kind === 'question9';

  alerts.push(...end.filter(isQ9), ...start.filter(isQ9));

  if (phq9Final && phq9Final.score - phq9.score >= PHQ9_RISE) {
    alerts.push({
      id: `${student.id}:phq9Rise:${phq9Final.at}`,
      kind: 'phq9Rise',
      student,
      urgent: true,
      title: `Final PHQ-9 went up by ${phq9Final.score - phq9.score}`,
      detail: `${phq9.score} at the start, ${phq9Final.score} at week 8`,
      at: phq9Final.at,
      final: true,
    });
  }

  if (student.epqr?.answers[WISHED_DEAD_INDEX]) {
    alerts.push({
      id: `${student.id}:epqrWish:${student.epqr.at}`,
      kind: 'epqrWish',
      student,
      urgent: true,
      title: 'Answered Yes to EPQ-R question 76',
      quote: EPQR_ITEMS[WISHED_DEAD_INDEX],
      detail: 'Answer: Yes',
      at: student.epqr.at,
    });
  }

  for (const message of student.messages) {
    if (message.from !== 'student' || !message.flagged) continue;
    alerts.push({
      id: `${student.id}:riskWords:${message.id}`,
      kind: 'riskWords',
      student,
      urgent: true,
      title: 'Used risk words in a message',
      quote: message.text,
      at: message.sentAt,
    });
  }

  const quiet = Math.floor((now.getTime() - new Date(student.lastActiveAt).getTime()) / DAY_MS);
  if (quiet >= INACTIVE_DAYS) {
    alerts.push({
      id: `${student.id}:inactive:${student.lastActiveAt}`,
      kind: 'inactive',
      student,
      urgent: false,
      title: `Not active for ${quiet} days`,
      at: new Date(new Date(student.lastActiveAt).getTime() + INACTIVE_DAYS * DAY_MS).toISOString(),
    });
  }

  alerts.push(...end.filter((a) => !isQ9(a)), ...start.filter((a) => !isQ9(a)));

  return alerts;
}

/** Alerts across the caseload that haven't been handled, urgent first and then newest. */
export function openAlerts(
  students: CaseloadStudent[],
  handled: string[] = [],
  now = new Date()
): StudentAlert[] {
  const done = new Set(handled);
  return students
    .flatMap((s) => studentAlerts(s, now))
    .filter((a) => !done.has(a.id))
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.at.localeCompare(a.at));
}

export type AlertStatus = 'new' | 'acknowledged' | 'handled';

export function alertStatus(events: AlertEvent[] = []): AlertStatus {
  if (events.some((e) => e.type === 'handled')) return 'handled';
  // Any action at all shows the researcher has seen it and is dealing with it.
  return events.length > 0 ? 'acknowledged' : 'new';
}

/** Ids of alerts that have been marked as handled. */
export function handledIds(events: Record<string, AlertEvent[]>): string[] {
  return Object.keys(events).filter((id) => alertStatus(events[id]) === 'handled');
}
