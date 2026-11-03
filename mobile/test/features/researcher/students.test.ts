import { describe, expect, it } from '@jest/globals';

import type { Call, CaseloadStudent } from '@/features/researcher/caseload';
import {
  QUIET_DAYS,
  activeLabel,
  filterStudents,
  nextCallFor,
  rowMark,
} from '@/features/researcher/studentsLogic';

const now = new Date(2026, 10, 3, 13, 0);

function at(daysBack: number, hour = 10) {
  return new Date(2026, 10, 3 - daysBack, hour).toISOString();
}

function student(id: string, patch: Partial<CaseloadStudent> = {}): CaseloadStudent {
  return {
    id,
    name: id,
    week: 2,
    joinedAt: at(10),
    joinedBy: 'random',
    lastActiveAt: at(0, 9),
    phq9: { answers: [], score: 10, item9: 0, at: at(10) },
    moods: [],
    sessions: {},
    journal: [],
    ...patch,
  };
}

const students = [
  student('Bola'),
  student('Ada', { lastActiveAt: at(QUIET_DAYS) }),
  student('Zee', { phq9: { answers: [], score: 15, item9: 1, at: at(1) } }),
  student('Chi', { lastActiveAt: at(7) }),
];

describe('filterStudents', () => {
  it('puts students who need the researcher first, then the rest alphabetically', () => {
    expect(filterStudents(students, 'all', '', now).map((s) => s.id)).toEqual([
      'Chi',
      'Zee',
      'Ada',
      'Bola',
    ]);
  });

  it('filters to those who need the researcher, or have gone quiet', () => {
    expect(
      filterStudents(students, 'needs', '', now)
        .map((s) => s.id)
        .sort()
    ).toEqual(['Chi', 'Zee']);
    expect(
      filterStudents(students, 'quiet', '', now)
        .map((s) => s.id)
        .sort()
    ).toEqual(['Ada', 'Chi']);
  });

  it('searches by name, ignoring case and spaces', () => {
    expect(filterStudents(students, 'all', '  bo ', now).map((s) => s.id)).toEqual(['Bola']);
  });
});

describe('rowMark', () => {
  it('shows urgent first, then how long they have been quiet', () => {
    expect(
      rowMark(student('a', { phq9: { answers: [], score: 9, item9: 2, at: at(1) } }), now)
    ).toEqual({
      kind: 'urgent',
    });
    expect(rowMark(student('a', { lastActiveAt: at(4) }), now)).toEqual({ kind: 'quiet', days: 4 });
  });

  it('otherwise shows the most recent mood this week, or nothing', () => {
    const moods = [
      { mood: 1, at: at(3, 20) },
      { mood: 3, at: at(1, 20) },
    ];
    expect(rowMark(student('a', { moods }), now)).toEqual({ kind: 'mood', mood: 3 });
    expect(rowMark(student('a', { moods: [{ mood: 2, at: at(9) }] }), now)).toEqual({
      kind: 'none',
    });
  });
});

describe('activeLabel', () => {
  it('reads naturally', () => {
    expect(activeLabel(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe('active now');
    expect(activeLabel(new Date(now.getTime() - 2 * 3_600_000).toISOString(), now)).toBe(
      'active 2h ago'
    );
    expect(activeLabel(at(1, 12), now)).toBe('active 1 day ago');
  });
});

describe('nextCallFor', () => {
  const calls: Call[] = [
    { studentId: 'a', startsAt: at(0, 10), durationMin: 30 },
    { studentId: 'a', startsAt: at(-2, 9), durationMin: 30 },
    { studentId: 'a', startsAt: at(-1, 9), durationMin: 30 },
    { studentId: 'b', startsAt: at(0, 15), durationMin: 30 },
  ];

  it('picks the soonest call for that student that is not over', () => {
    expect(nextCallFor('a', calls, now)?.startsAt).toBe(at(-1, 9));
    expect(nextCallFor('c', calls, now)).toBeNull();
  });
});
