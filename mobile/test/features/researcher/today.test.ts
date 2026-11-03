import { describe, expect, it } from '@jest/globals';

import { Call, CaseloadStudent, mockCaseload } from '@/features/researcher/caseload';
import {
  INACTIVE_DAYS,
  callState,
  callsToday,
  greeting,
  needsYou,
  nextCall,
} from '@/features/researcher/todayLogic';

const now = new Date(2026, 10, 3, 13, 0);

function at(daysBack: number, hour = 10, minute = 0) {
  return new Date(2026, 10, 3 - daysBack, hour, minute).toISOString();
}

function student(patch: Partial<CaseloadStudent> = {}): CaseloadStudent {
  return {
    id: 's1',
    name: 'Test Student',
    week: 2,
    joinedAt: at(10),
    joinedBy: 'random',
    lastActiveAt: at(0, 9),
    phq9: { answers: [], score: 10, item9: 0, at: at(10) },
    moods: [],
    sessionsDone: 1,
    ...patch,
  };
}

function call(startsAt: string, durationMin = 30): Call {
  return { studentId: 's1', startsAt, durationMin };
}

describe('needsYou', () => {
  it('flags question 9 above zero as urgent, and puts it first', () => {
    const items = needsYou(
      [
        student({ id: 'quiet', lastActiveAt: at(INACTIVE_DAYS + 1) }),
        student({ id: 'risk', phq9: { answers: [], score: 9, item9: 1, at: at(1) } }),
      ],
      now
    );
    expect(items.map((i) => [i.student.id, i.urgent])).toEqual([
      ['risk', true],
      ['quiet', false],
    ]);
  });

  it('flags long inactivity and severe scores, but not students who are fine', () => {
    const items = needsYou(
      [
        student({ id: 'quiet', lastActiveAt: at(6) }),
        student({ id: 'severe', phq9: { answers: [], score: 21, item9: 0, at: at(3) } }),
        student({ id: 'fine' }),
      ],
      now
    );
    expect(items.map((i) => i.reason)).toEqual([
      'Not active for 6 days',
      'Severe PHQ-9 score (21)',
    ]);
  });
});

describe('callState', () => {
  const c = call(at(0, 14));
  const t = (h: number, m = 0) => new Date(2026, 10, 3, h, m);

  it('is upcoming, then live from 10 minutes before, then done once it ends', () => {
    expect(callState(c, t(13, 40))).toBe('upcoming');
    expect(callState(c, t(13, 50))).toBe('live');
    expect(callState(c, t(14, 25))).toBe('live');
    expect(callState(c, t(14, 31))).toBe('done');
  });
});

describe('callsToday and nextCall', () => {
  const calls = [call(at(0, 16)), call(at(-1, 9)), call(at(0, 10)), call(at(0, 14))];

  it('lists only today, earliest first', () => {
    expect(callsToday(calls, now).map((c) => new Date(c.startsAt).getHours())).toEqual([
      10, 14, 16,
    ]);
  });

  it('finds the next call still to happen today', () => {
    expect(new Date(nextCall(calls, now)!.startsAt).getHours()).toBe(14);
    expect(nextCall(calls, new Date(2026, 10, 3, 18))).toBeNull();
  });
});

describe('greeting', () => {
  it('follows the time of day', () => {
    expect(greeting(new Date(2026, 10, 3, 8))).toBe('Good morning');
    expect(greeting(new Date(2026, 10, 3, 13))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 10, 3, 19))).toBe('Good evening');
  });
});

describe('mock caseload', () => {
  // The Today screen should always have something in each section to show.
  it('has someone who needs attention and calls today', () => {
    const { students, calls } = mockCaseload(now);
    expect(needsYou(students, now).some((i) => i.urgent)).toBe(true);
    expect(callsToday(calls, now).length).toBeGreaterThan(0);
  });
});

describe('mock PHQ-9 answers', () => {
  // The researcher's answers screen shows these, so they must agree with the stored score.
  it('add up to each score and keep question 9 as flagged', () => {
    for (const s of mockCaseload(now).students) {
      expect(s.phq9.answers).toHaveLength(9);
      expect(s.phq9.answers.reduce((a, b) => a + b, 0)).toBe(s.phq9.score);
      expect(s.phq9.answers[8]).toBe(s.phq9.item9);
      expect(s.phq9.answers.every((a) => a >= 0 && a <= 3)).toBe(true);
    }
  });
});
