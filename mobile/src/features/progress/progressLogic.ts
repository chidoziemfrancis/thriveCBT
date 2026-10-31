import type { Icon3DName } from '@/components/icons/icon3dSources';
import { MoodEntry, moodOnDay } from '@/features/mood/moodLog';

export type MoodDay = { date: Date; mood: number | null };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBefore(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
}

/** One slot per day, oldest first and ending today, with the day's last mood or null. */
export function dailyMoods(entries: MoodEntry[], days: number, now = new Date()): MoodDay[] {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const date = daysBefore(today, days - 1 - i);
    return { date, mood: moodOnDay(entries, date)?.mood ?? null };
  });
}

/**
 * Days in a row with a mood logged. Today doesn't break the streak until it's over, so a
 * student who hasn't checked in yet this morning still sees yesterday's streak.
 */
export function moodStreak(entries: MoodEntry[], now = new Date()): number {
  let day = moodOnDay(entries, now) ? startOfDay(now) : daysBefore(now, 1);
  let streak = 0;
  while (moodOnDay(entries, day)) {
    streak += 1;
    day = daysBefore(day, 1);
  }
  return streak;
}

/** The longest run of consecutive days with a mood, at any point. */
export function longestStreak(entries: MoodEntry[]): number {
  const days = [...new Set(entries.map((e) => startOfDay(new Date(e.at)).getTime()))].sort(
    (a, b) => a - b
  );
  let best = 0;
  let run = 0;
  days.forEach((day, i) => {
    const previous = days[i - 1];
    // A day is consecutive when the previous logged day is exactly the calendar day before.
    run = i > 0 && daysBefore(new Date(day), 1).getTime() === previous ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

/** The mood logged most often, preferring the more recent one on a tie. Null with no moods. */
export function mostCommonMood(days: MoodDay[]): number | null {
  const counts = new Map<number, number>();
  let best: number | null = null;
  for (const { mood } of days) {
    if (mood === null) continue;
    const count = (counts.get(mood) ?? 0) + 1;
    counts.set(mood, count);
    if (best === null || count >= (counts.get(best) ?? 0)) best = mood;
  }
  return best;
}

export type ProgressStats = {
  sessionsDone: number;
  totalSessions: number;
  moodsLogged: number;
  bestStreak: number;
  checkIns: number;
  journalEntries: number;
};

export type Badge = {
  id: string;
  title: string;
  /** How to earn it, shown while it's locked. */
  hint: string;
  image: Icon3DName;
  earned: boolean;
};

// Small, reachable goals: the point is to notice effort, not to rank anyone.
export function badges(stats: ProgressStats): Badge[] {
  return [
    {
      id: 'first-session',
      title: 'First step',
      hint: 'Finish your first session',
      image: 'play',
      earned: stats.sessionsDone >= 1,
    },
    {
      id: 'first-mood',
      title: 'Checked in',
      hint: 'Log your first mood',
      image: 'heart',
      earned: stats.moodsLogged >= 1,
    },
    {
      id: 'mood-streak',
      title: '7-day streak',
      hint: 'Log your mood 7 days in a row',
      image: 'sun',
      earned: stats.bestStreak >= 7,
    },
    {
      id: 'first-call',
      title: 'Face to face',
      hint: 'Join your first check-in call',
      image: 'videoCamera',
      earned: stats.checkIns >= 1,
    },
    {
      id: 'journal',
      title: 'Reflector',
      hint: 'Write 3 journal entries',
      image: 'notebook',
      earned: stats.journalEntries >= 3,
    },
    {
      id: 'halfway',
      title: 'Halfway there',
      hint: `Finish ${Math.ceil(stats.totalSessions / 2)} sessions`,
      image: 'flag',
      earned: stats.sessionsDone >= Math.ceil(stats.totalSessions / 2),
    },
    {
      id: 'finished',
      title: 'All done',
      hint: `Finish all ${stats.totalSessions} sessions`,
      image: 'trophy',
      earned: stats.sessionsDone >= stats.totalSessions,
    },
  ];
}
