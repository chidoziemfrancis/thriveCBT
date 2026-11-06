import type { Call, PastCall } from './caseload';

export type CallOutcome = 'good' | 'concerns';

/** What the researcher noted after a call. Only researchers and the study team see it. */
export type CallRecord = {
  callId: string;
  studentId: string;
  startsAt: string;
  attended: boolean;
  minutes: number;
  outcome?: CallOutcome;
  note?: string;
};

export const OUTCOME_LABELS: Record<CallOutcome, string> = {
  good: 'Went well',
  concerns: 'Some concerns',
};

export function callRecord(
  call: Call,
  {
    attended,
    seconds,
    outcome,
    note,
  }: {
    attended: boolean;
    seconds: number;
    outcome?: CallOutcome;
    note?: string;
  }
): CallRecord {
  return {
    callId: call.id,
    studentId: call.studentId,
    startsAt: call.startsAt,
    attended,
    // A call that connected counts as at least a minute.
    minutes: attended ? Math.max(1, Math.round(seconds / 60)) : 0,
    outcome: attended ? outcome : undefined,
    note: note?.trim() || undefined,
  };
}

export function withLoggedCalls(pastCalls: PastCall[], records: CallRecord[]): PastCall[] {
  const logged = records.map((r): PastCall => ({
    startsAt: r.startsAt,
    attended: r.attended,
    minutes: r.attended ? r.minutes : undefined,
    researcherNote: r.outcome || r.note ? { outcome: r.outcome, text: r.note } : undefined,
  }));
  const times = new Set(logged.map((c) => c.startsAt));
  return [...logged, ...pastCalls.filter((c) => !times.has(c.startsAt))].sort((a, b) =>
    b.startsAt.localeCompare(a.startsAt)
  );
}
