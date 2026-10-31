import { readJson, writeJson } from '@/lib/storage';

import { CheckIn, CheckInFeedback, rollForward } from './checkinLogic';

const CHECKIN_KEY = 'next_checkin';
const FEEDBACK_KEY = 'checkin_feedback';

const DURATION_MIN = 30;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Until researchers book real slots, the first mock check-in starts a few minutes after it is
// first needed, so the whole call flow can be tried straight away.
const MOCK_FIRST_START_MS = 5 * 60_000;

export function getNextCheckIn(researcherId: string | undefined, now = new Date()): CheckIn | null {
  if (!researcherId) return null;
  const saved = readJson<CheckIn | null>(CHECKIN_KEY, null);
  if (saved && saved.researcherId === researcherId) {
    const current = rollForward(saved, now);
    if (current !== saved) writeJson(CHECKIN_KEY, current);
    return current;
  }

  const created: CheckIn = {
    id: `checkin-${now.getTime()}`,
    researcherId,
    startsAt: new Date(now.getTime() + MOCK_FIRST_START_MS).toISOString(),
    durationMin: DURATION_MIN,
  };
  writeJson(CHECKIN_KEY, created);
  return created;
}

export function getCheckInHistory(): CheckInFeedback[] {
  return readJson<CheckInFeedback[]>(FEEDBACK_KEY, []);
}

/** Saves how the call felt and books the same slot next week. */
export function completeCheckIn(
  checkIn: CheckIn,
  feedback: Omit<CheckInFeedback, 'checkInId' | 'at'>,
  now = new Date()
) {
  const history = readJson<CheckInFeedback[]>(FEEDBACK_KEY, []);
  writeJson(FEEDBACK_KEY, [
    ...history,
    { ...feedback, checkInId: checkIn.id, at: now.toISOString() },
  ]);

  const nextStart = new Date(new Date(checkIn.startsAt).getTime() + WEEK_MS);
  writeJson(CHECKIN_KEY, {
    ...checkIn,
    id: `checkin-${nextStart.getTime()}`,
    startsAt: nextStart.toISOString(),
  } satisfies CheckIn);
}
