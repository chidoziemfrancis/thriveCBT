import type { FeatureIconName } from '@/components/icons/FeatureIcon';
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
  icon: FeatureIconName;
  earned: boolean;
};

// Small, reachable goals: the point is to notice effort, not to rank anyone.
export function badges(stats: ProgressStats): Badge[] {
  return [
    {
      id: 'first-session',
      title: 'First step',
      hint: 'Finish your first session',
      icon: 'play',
      earned: stats.sessionsDone >= 1,
    },
    {
      id: 'first-mood',
      title: 'Checked in',
      hint: 'Log your first mood',
      icon: 'heart',
      earned: stats.moodsLogged >= 1,
    },
    {
      id: 'mood-streak',
      title: '7-day streak',
      hint: 'Log your mood 7 days in a row',
      icon: 'sun',
      earned: stats.bestStreak >= 7,
    },
    {
      id: 'first-call',
      title: 'Face to face',
      hint: 'Join your first check-in call',
      icon: 'video',
      earned: stats.checkIns >= 1,
    },
    {
      id: 'journal',
      title: 'Reflector',
      hint: 'Write 3 journal entries',
      icon: 'book',
      earned: stats.journalEntries >= 3,
    },
    {
      id: 'halfway',
      title: 'Halfway there',
      hint: `Finish ${Math.ceil(stats.totalSessions / 2)} sessions`,
      icon: 'flag',
      earned: stats.sessionsDone >= Math.ceil(stats.totalSessions / 2),
    },
    {
      id: 'finished',
      title: 'All done',
      hint: `Finish all ${stats.totalSessions} sessions`,
      icon: 'trophy',
      earned: stats.sessionsDone >= stats.totalSessions,
    },
  ];
}

/** "Good" and "Great". */
const GOOD_MOOD = 3;

export type WeekDay = MoodDay & { isToday: boolean; isFuture: boolean };

/** Monday to Sunday of the current week, so the strip reads like a calendar. */
export function currentWeek(entries: MoodEntry[], now = new Date()): WeekDay[] {
  const today = startOfDay(now);
  const sinceMonday = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const date = daysBefore(today, sinceMonday - i);
    const offset = date.getTime() - today.getTime();
    return {
      date,
      mood: offset > 0 ? null : (moodOnDay(entries, date)?.mood ?? null),
      isToday: offset === 0,
      isFuture: offset > 0,
    };
  });
}

/** Good days are "Good" or "Great". The percent is of logged days, not of the whole week. */
export function goodDayShare(days: MoodDay[]) {
  const logged = days.filter((d) => d.mood !== null);
  const good = logged.filter((d) => (d.mood ?? 0) >= GOOD_MOOD).length;
  return {
    good,
    logged: logged.length,
    percent: logged.length ? Math.round((good / logged.length) * 100) : 0,
  };
}

const MORNING_ENDS_HOUR = 12;
const MIN_ENTRIES_FOR_PATTERN = 4;
const NOTICEABLE_CHANGE = 0.5;

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * One plain-language observation about the student's moods, or null with too little to go
 * on. Harder weeks point gently to the researcher rather than sounding like a grade.
 */
export function moodInsight(entries: MoodEntry[], now = new Date()): string | null {
  const recent = dailyMoods(entries, 14, now);
  const lastWeek = recent.slice(0, 7).flatMap((d) => (d.mood === null ? [] : [d.mood]));
  const thisWeek = recent.slice(7).flatMap((d) => (d.mood === null ? [] : [d.mood]));

  if (lastWeek.length >= 2 && thisWeek.length >= 2) {
    const change = average(thisWeek) - average(lastWeek);
    if (change >= NOTICEABLE_CHANGE) {
      return 'You’ve been feeling a bit better than last week. Keep it up.';
    }
    if (change <= -NOTICEABLE_CHANGE) {
      return 'This week has felt harder than last. Your researcher is here if you want to talk.';
    }
  }

  const mornings = entries.filter((e) => new Date(e.at).getHours() < MORNING_ENDS_HOUR);
  const later = entries.filter((e) => new Date(e.at).getHours() >= MORNING_ENDS_HOUR);
  if (mornings.length >= 2 && later.length >= 2 && entries.length >= MIN_ENTRIES_FOR_PATTERN) {
    const change = average(mornings.map((e) => e.mood)) - average(later.map((e) => e.mood));
    if (change >= NOTICEABLE_CHANGE) return 'You tend to feel brighter in the mornings.';
    if (change <= -NOTICEABLE_CHANGE) return 'Your days tend to get better as they go on.';
  }

  const streak = moodStreak(entries, now);
  if (streak >= 3) return `${streak} days of checking in in a row. That habit really helps.`;
  if (entries.length > 0) return 'Logging your mood most days helps you spot patterns over time.';
  return null;
}
