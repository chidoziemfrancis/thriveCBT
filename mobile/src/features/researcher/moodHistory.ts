import { MoodEntry, moodOnDay } from '@/features/mood/moodLog';
import { MoodDay, mostCommonMood } from '@/features/progress/progressLogic';

export type MoodWeek = {
  week: number;
  start: Date;
  end: Date;
  /** Seven days from the week's start; days still to come have no mood. */
  days: (MoodDay & { future: boolean })[];
  mostOften: number | null;
};

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * The student's moods split into study weeks, counted from the day they joined, newest first,
 * so a researcher can see how each week went.
 */
export function moodWeeks(moods: MoodEntry[], joinedAt: string, now = new Date()): MoodWeek[] {
  const first = dayStart(new Date(joinedAt));
  const today = dayStart(now);
  const weeks: MoodWeek[] = [];
  for (let start = first, week = 1; start <= today; start = addDays(start, 7), week++) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const future = date > today;
      return { date, future, mood: future ? null : (moodOnDay(moods, date)?.mood ?? null) };
    });
    weeks.push({ week, start, end: addDays(start, 6), days, mostOften: mostCommonMood(days) });
  }
  return weeks.reverse();
}
