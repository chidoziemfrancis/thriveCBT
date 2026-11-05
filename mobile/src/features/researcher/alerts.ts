import { PHQ9_OPTIONS, PHQ9_QUESTIONS, SUICIDAL_IDEATION_INDEX } from '@/features/assessment/phq9';

import type { AlertEvent } from './alertStore';
import type { CaseloadStudent } from './caseload';

const DAY_MS = 24 * 60 * 60 * 1000;

// Draft thresholds until the study team confirms them.
export const INACTIVE_DAYS = 5;
export const SEVERE_PHQ9 = 20;

export type AlertKind = 'question9' | 'riskWords' | 'severe' | 'inactive';

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
};

/** Every alert a student has raised, most serious kind first. */
export function studentAlerts(student: CaseloadStudent, now = new Date()): StudentAlert[] {
  const alerts: StudentAlert[] = [];
  const { phq9 } = student;

  if (phq9.item9 > 0) {
    alerts.push({
      id: `${student.id}:question9:${phq9.at}`,
      kind: 'question9',
      student,
      urgent: true,
      title: 'Answered question 9 above zero',
      quote: PHQ9_QUESTIONS[SUICIDAL_IDEATION_INDEX],
      detail: `Answer: ${PHQ9_OPTIONS.find((o) => o.value === phq9.item9)?.label ?? phq9.item9}`,
      at: phq9.at,
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

  if (phq9.score >= SEVERE_PHQ9) {
    alerts.push({
      id: `${student.id}:severe:${phq9.at}`,
      kind: 'severe',
      student,
      urgent: false,
      title: `Severe PHQ-9 score (${phq9.score})`,
      detail: `${phq9.score} of 27`,
      at: phq9.at,
    });
  }

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
