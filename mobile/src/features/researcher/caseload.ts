import type { AssignmentMethod } from '@/features/assignment/assign';
import type { JournalEntry } from '@/features/journal/journalStore';
import type { MoodEntry } from '@/features/mood/moodLog';
import type { StepAnswer } from '@/features/sessions/content/types';
import type { SessionRecord } from '@/features/sessions/sessionLogic';

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
  /** Every mood logged since joining, oldest first. */
  moods: MoodEntry[];
  /** Each session's progress and answers, keyed by session number, as on the student side. */
  sessions: Record<number, SessionRecord>;
  journal: JournalEntry[];
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

/**
 * A mood for each day since joining, oldest first. `pattern` repeats across the weeks and
 * `lift` raises later weeks a little, so longer-running students show a trend. Null skips a
 * day, as real students do.
 */
function moodHistory(now: Date, days: number, pattern: (number | null)[], lift = 0): MoodEntry[] {
  const entries: MoodEntry[] = [];
  for (let i = 0; i < days; i++) {
    const base = pattern[i % pattern.length];
    if (base === null) continue;
    const mood = Math.min(4, Math.max(0, Math.round(base + (lift * i) / Math.max(days, 1))));
    entries.push({ mood, at: at(now, days - 1 - i, 20) });
  }
  return entries;
}

const SESSION_1_PARTS = ['lesson', 'mood-check', 'quiz', 'journal'];

/** Session 1 answers keyed by its step ids, so the researcher sees what was really chosen. */
function session1(
  completedAt: string | undefined,
  picks: { noticed: number[]; pressures: number[]; scales: number[]; quiz: number[] },
  reflection?: string,
  partsDone = SESSION_1_PARTS
): SessionRecord {
  const answers: Record<string, StepAnswer> = {
    'myth-sad': false,
    'four-ways': ['thoughts', 'feelings', 'body', 'behaviour'],
    noticed: picks.noticed,
    pressures: picks.pressures,
    breathe: true,
    'myth-weak': false,
  };
  if (partsDone.includes('mood-check')) {
    ['sadness', 'motivation', 'sleep', 'energy', 'concentration'].forEach((id, i) => {
      answers[id] = picks.scales[i];
    });
  }
  if (partsDone.includes('quiz')) {
    ['q1', 'q2', 'q3'].forEach((id, i) => (answers[id] = picks.quiz[i]));
  }
  if (reflection) answers.reflect = reflection;
  return { done: partsDone, answers, completedAt };
}

/** Sessions 2 onwards have no written content yet, so only completion is recorded. */
function laterSessions(now: Date, count: number, joinedDaysAgo: number) {
  const sessions: Record<number, SessionRecord> = {};
  for (let id = 2; id <= count + 1; id++) {
    sessions[id] = { done: [], completedAt: at(now, joinedDaysAgo - (id - 1) * 7 - 2, 19) };
  }
  return sessions;
}

function entry(
  now: Date,
  id: string,
  daysBack: number,
  text: string,
  prompt?: string,
  mood?: number,
  sessionId?: number
): JournalEntry {
  return { id, text, prompt, mood, sessionId, at: at(now, daysBack, 21) };
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
      moods: moodHistory(now, 2, [1]),
      sessions: {
        1: session1(
          undefined,
          { noticed: [0, 3, 5], pressures: [1, 4], scales: [], quiz: [] },
          undefined,
          ['lesson']
        ),
      },
      journal: [
        entry(
          now,
          'j-tolu-1',
          1,
          'I don’t really know what to write. Everything feels heavy and I can’t explain it to anyone at home.',
          'What’s been on your mind most today?',
          0
        ),
      ],
    },
    {
      id: 's-chiamaka',
      name: 'Chiamaka Obi',
      week: 5,
      joinedAt: at(now, 30, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 5),
      phq9: phq9(12, 0, at(now, 30, 9)),
      moods: moodHistory(now, 30, [2, 2, 3, null, 2, 3, 3], 1.4),
      sessions: {
        1: session1(
          at(now, 27, 19),
          { noticed: [0, 2, 4], pressures: [0, 2], scales: [4, 2, 2, 2, 3], quiz: [1, 0, 0] },
          'Mostly my sleep and my focus in class. I stopped going to the library with my friends.'
        ),
        ...laterSessions(now, 3, 30),
      },
      journal: [
        entry(
          now,
          'j-chi-1',
          27,
          'Mostly my sleep and my focus in class. I stopped going to the library with my friends.',
          'What has depression affected most in your life?',
          undefined,
          1
        ),
        entry(
          now,
          'j-chi-2',
          16,
          'Went to the library with Ada today. I almost cancelled but I’m glad I didn’t.',
          'What’s one thing that went better than you expected this week?',
          3
        ),
        entry(
          now,
          'j-chi-3',
          3,
          'I noticed I keep telling myself I’ll fail the exam. When I wrote it down it looked less true.',
          'What’s a thought that kept coming back today? How true does it feel now?',
          3
        ),
      ],
    },
    {
      id: 's-ifeanyi',
      name: 'Ifeanyi Nwosu',
      week: 2,
      joinedAt: at(now, 10, 9),
      joinedBy: 'random',
      lastActiveAt: at(now, 6, 18),
      phq9: phq9(13, 0, at(now, 9, 9)),
      moods: moodHistory(now, 4, [2, 1, 2, 2]),
      sessions: {
        1: session1(
          at(now, 7, 20),
          { noticed: [1, 3], pressures: [2], scales: [3, 1, 3, 2, 2], quiz: [1, 1, 0] },
          'I don’t enjoy football anymore. I used to play every weekend.'
        ),
      },
      journal: [
        entry(
          now,
          'j-ife-1',
          7,
          'I don’t enjoy football anymore. I used to play every weekend.',
          'What has depression affected most in your life?',
          undefined,
          1
        ),
      ],
    },
    {
      id: 's-zainab',
      name: 'Zainab Bello',
      week: 4,
      joinedAt: at(now, 24, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 20),
      phq9: phq9(14, 0, at(now, 24, 9)),
      moods: moodHistory(now, 23, [2, 2, 1, 2, null, 1, 2], -1.2),
      sessions: {
        1: session1(
          at(now, 21, 20),
          { noticed: [0, 1, 4], pressures: [4, 3], scales: [4, 2, 1, 2, 2], quiz: [1, 0, 0] },
          'My family. I feel like I’m letting them down every time I call home.'
        ),
        ...laterSessions(now, 2, 24),
      },
      journal: [
        entry(
          now,
          'j-zai-1',
          21,
          'My family. I feel like I’m letting them down every time I call home.',
          'What has depression affected most in your life?',
          undefined,
          1
        ),
        entry(
          now,
          'j-zai-2',
          2,
          'Bad week. I skipped two lectures and stayed in my room.',
          undefined,
          0
        ),
      ],
    },
    {
      id: 's-emeka',
      name: 'Emeka Okeke',
      week: 6,
      joinedAt: at(now, 38, 9),
      joinedBy: 'random',
      lastActiveAt: at(now, 3, 9),
      phq9: phq9(11, 0, at(now, 38, 9)),
      moods: moodHistory(now, 36, [2, null, 3, null, 2, null, null], 0.6),
      sessions: {
        1: session1(
          at(now, 34, 20),
          { noticed: [3, 4], pressures: [0], scales: [3, 2, 3, 2, 2], quiz: [0, 0, 0] },
          'Concentration. I read the same page five times.'
        ),
        ...laterSessions(now, 1, 38),
      },
      journal: [],
    },
    {
      id: 's-seyi',
      name: 'Seyi Ogunleye',
      week: 3,
      joinedAt: at(now, 17, 9),
      joinedBy: 'invite',
      lastActiveAt: hoursAgo(now, 9),
      phq9: phq9(21, 0, at(now, 17, 9)),
      moods: moodHistory(now, 17, [1, 2, 1, 2, 2, null, 2]),
      sessions: {
        1: session1(
          at(now, 14, 20),
          {
            noticed: [0, 1, 2, 3, 5],
            pressures: [0, 1, 2],
            scales: [5, 1, 1, 1, 2],
            quiz: [1, 0, 1],
          },
          'Everything really. Getting out of bed is the hardest part.'
        ),
        ...laterSessions(now, 1, 17),
      },
      journal: [
        entry(
          now,
          'j-seyi-1',
          14,
          'Everything really. Getting out of bed is the hardest part.',
          'What has depression affected most in your life?',
          undefined,
          1
        ),
        entry(
          now,
          'j-seyi-2',
          5,
          'My roommate made jollof and we ate together. Small thing but it helped.',
          'Who made your day a little easier lately, and how?',
          2
        ),
      ],
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

/** Sessions the student has finished. */
export function sessionsCompleted(student: CaseloadStudent): number {
  return Object.values(student.sessions).filter((r) => r.completedAt).length;
}
