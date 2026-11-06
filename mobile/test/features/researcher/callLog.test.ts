import { describe, expect, it } from '@jest/globals';

import { callRecord, withLoggedCalls } from '@/features/researcher/callLog';
import type { Call, PastCall } from '@/features/researcher/caseload';

const call: Call = {
  id: 'c1',
  studentId: 's-tolu',
  startsAt: '2026-11-05T10:00:00.000Z',
  durationMin: 30,
};

describe('callRecord', () => {
  it('rounds the call to whole minutes, at least one', () => {
    expect(callRecord(call, { attended: true, seconds: 24 * 60 + 40 }).minutes).toBe(25);
    expect(callRecord(call, { attended: true, seconds: 5 }).minutes).toBe(1);
  });

  it('keeps no length or outcome for a call that didn’t happen', () => {
    const record = callRecord(call, { attended: false, seconds: 90, outcome: 'good' });
    expect(record).toMatchObject({ attended: false, minutes: 0, outcome: undefined });
  });

  it('drops a blank note and trims a real one', () => {
    expect(callRecord(call, { attended: true, seconds: 60, note: '   ' }).note).toBeUndefined();
    expect(callRecord(call, { attended: true, seconds: 60, note: ' Exam stress ' }).note).toBe(
      'Exam stress'
    );
  });
});

describe('withLoggedCalls', () => {
  const older: PastCall = { startsAt: '2026-10-29T10:00:00.000Z', attended: true, minutes: 20 };

  it('adds the logged call to the log, newest first, with the researcher’s note', () => {
    const record = callRecord(call, {
      attended: true,
      seconds: 1200,
      outcome: 'concerns',
      note: 'Sleep is worse',
    });
    const log = withLoggedCalls([older], [record]);
    expect(log.map((c) => c.startsAt)).toEqual([call.startsAt, older.startsAt]);
    expect(log[0]).toMatchObject({
      attended: true,
      minutes: 20,
      researcherNote: { outcome: 'concerns', text: 'Sleep is worse' },
    });
  });

  it('shows a skipped note as a plain call and a missed one as missed', () => {
    const skipped = withLoggedCalls([], [callRecord(call, { attended: true, seconds: 600 })]);
    expect(skipped[0].researcherNote).toBeUndefined();
    const missed = withLoggedCalls([], [callRecord(call, { attended: false, seconds: 0 })]);
    expect(missed[0]).toMatchObject({ attended: false, minutes: undefined });
  });

  it('replaces an existing entry for the same call instead of listing it twice', () => {
    const same: PastCall = { startsAt: call.startsAt, attended: false };
    const log = withLoggedCalls([same], [callRecord(call, { attended: true, seconds: 600 })]);
    expect(log).toHaveLength(1);
    expect(log[0].attended).toBe(true);
  });
});
