import { describe, expect, it } from '@jest/globals';

import { callCounts, mockCaseload } from '@/features/researcher/caseload';

const now = new Date(2026, 10, 3, 13, 0);

describe('callCounts', () => {
  it('counts attended and missed calls', () => {
    expect(
      callCounts([
        { startsAt: '2026-10-30T14:00:00.000Z', attended: true, minutes: 28 },
        { startsAt: '2026-10-23T14:00:00.000Z', attended: false },
      ])
    ).toEqual({ total: 2, attended: 1, missed: 1 });
    expect(callCounts([])).toEqual({ total: 0, attended: 0, missed: 0 });
  });
});

describe('mock call history', () => {
  const { students } = mockCaseload(now);

  it('lists calls newest first, all in the past', () => {
    for (const s of students) {
      const times = s.pastCalls.map((c) => c.startsAt);
      expect([...times].sort().reverse()).toEqual(times);
      expect(times.every((t) => new Date(t) < now)).toBe(true);
    }
  });

  // A missed call has nothing to rate, and an attended one always has a length.
  it('only gives length and feedback to calls that happened', () => {
    for (const call of students.flatMap((s) => s.pastCalls)) {
      if (call.attended) expect(call.minutes).toBeGreaterThan(0);
      else expect(call.minutes ?? call.feedback).toBeUndefined();
    }
  });
});
