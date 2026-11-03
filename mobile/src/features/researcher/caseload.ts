import type { AssignmentMethod } from '@/features/assignment/assign';
import type { MoodEntry } from '@/features/mood/moodLog';

export type CaseloadStudent = {
  id: string;
  name: string;
  week: number;
  joinedAt: string;
  joinedBy: AssignmentMethod;
  lastActiveAt: string;
  /**
   * The latest PHQ-9: each answer (0 to 3, in question order), the total, and question 9
   * (thoughts of self-harm) on its own because safety checks key off it.
   */
  phq9: { answers: number[]; score: number; item9: number; at: string };
  moods: MoodEntry[];
  sessionsDone: number;
};

export type Call = { studentId: string; startsAt: string; durationMin: number };

function at(now: Date, daysBack: number, hour: number, minute = 0) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysBack,
    hour,
    minute
  ).toISOString();
}

function hoursAgo(now: Date, hours: number) {
  return new Date(now.getTime() - hours * 3_600_000).toISOString();
}

/**
 * A believable set of nine answers adding up to `score`, with question 9 set to `item9`.
 * Points are spread from the first question onwards, at most 3 each.
 */
function phq9(score: number, item9: number, takenAt: string) {
  const answers = Array<number>(9).fill(0);
  answers[8] = item9;
  let left = score - item9;
  for (let round = 0; left > 0 && round < 3; round++) {
    for (let i = 0; i < 8 && left > 0; i++) {
      answers[i] += 1;
      left -= 1;
    }
  }
  return { answers, score, item9, at: takenAt };
}

/** One mood per day, oldest first and ending today; null skips a day. */
function moods(now: Date, pattern: (number | null)[]): MoodEntry[] {
  return pattern.flatMap((mood, i) =>
    mood === null ? [] : [{ mood, at: at(now, pattern.length - 1 - i, 20) }]
  );
}

// Stand-in caseload for Grace until the backend serves real students. Dates are built around
// `now` so it always looks current.
export function mockCaseload(now = new Date()): { students: CaseloadStudent[]; calls: Call[] } {
  const students: CaseloadStudent[] = [
    {
      id: 's-tolu',
      name: 'Tolu Adebayo',
      week: 1,
      joinedAt: at(now, 2, 9),
      joinedBy: 'random',
      lastActiveAt: hoursAgo(now, 2),
      phq9: phq9(17, 1, at(now, 1, 9)),
      moods: moods(now, [1, 1]),
      sessionsDone: 0,
    },
    {
      id: 's-chiamaka',
      name: 'Chiamaka Obi',
      week: 5,
      joinedAt: at(now, 30, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 5),
      phq9: phq9(12, 0, at(now, 30, 9)),
      moods: moods(now, [3, 3, 4, 3, 4, 4, 3]),
      sessionsDone: 4,
    },
    {
      id: 's-ifeanyi',
      name: 'Ifeanyi Nwosu',
      week: 2,
      joinedAt: at(now, 10, 9),
      joinedBy: 'random',
      lastActiveAt: at(now, 6, 18),
      phq9: phq9(13, 0, at(now, 9, 9)),
      moods: moods(now, [2, 2, null, null, null, null, null]),
      sessionsDone: 1,
    },
    {
      id: 's-zainab',
      name: 'Zainab Bello',
      week: 4,
      joinedAt: at(now, 24, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 20),
      phq9: phq9(14, 0, at(now, 24, 9)),
      moods: moods(now, [2, 2, 1, 1, 0, 1, null]),
      sessionsDone: 3,
    },
    {
      id: 's-emeka',
      name: 'Emeka Okeke',
      week: 6,
      joinedAt: at(now, 38, 9),
      joinedBy: 'random',
      lastActiveAt: at(now, 3, 9),
      phq9: phq9(11, 0, at(now, 38, 9)),
      moods: moods(now, [2, null, 3, null, 2, null, null]),
      sessionsDone: 2,
    },
    {
      id: 's-seyi',
      name: 'Seyi Ogunleye',
      week: 3,
      joinedAt: at(now, 17, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 9),
      phq9: phq9(21, 0, at(now, 17, 9)),
      moods: moods(now, [1, 2, 1, 2, 2, null, 2]),
      sessionsDone: 2,
    },
  ];
  const calls: Call[] = [
    { studentId: 's-chiamaka', startsAt: at(now, 0, 10), durationMin: 30 },
    { studentId: 's-zainab', startsAt: at(now, 0, 14), durationMin: 30 },
    { studentId: 's-emeka', startsAt: at(now, 0, 16, 30), durationMin: 30 },
    { studentId: 's-seyi', startsAt: at(now, -1, 11), durationMin: 30 },
    { studentId: 's-tolu', startsAt: at(now, -1, 15), durationMin: 30 },
  ];
  return { students, calls };
}
