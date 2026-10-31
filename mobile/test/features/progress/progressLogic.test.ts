import { describe, expect, it } from '@jest/globals';

import type { MoodEntry } from '@/features/mood/moodLog';
import {
  currentWeek,
  dailyMoods,
  goodDayShare,
  longestStreak,
  moodInsight,
  moodStreak,
  mostCommonMood,
} from '@/features/progress/progressLogic';

const now = new Date(2026, 9, 31, 12, 0);

function on(daysAgo: number, mood: number, hour = 9): MoodEntry {
  return { mood, at: new Date(2026, 9, 31 - daysAgo, hour).toISOString() };
}

describe('dailyMoods', () => {
  it('returns one slot per day ending today, oldest first', () => {
    const days = dailyMoods([on(0, 3), on(2, 1)], 3, now);
    expect(days.map((d) => d.date.getDate())).toEqual([29, 30, 31]);
    expect(days.map((d) => d.mood)).toEqual([1, null, 3]);
  });

  it('uses the last mood logged on a day', () => {
    const days = dailyMoods([on(0, 1, 8), on(0, 4, 20)], 1, now);
    expect(days[0].mood).toBe(4);
  });
});

describe('moodStreak', () => {
  it('counts consecutive days up to today', () => {
    expect(moodStreak([on(0, 2), on(1, 2), on(2, 3), on(4, 1)], now)).toBe(3);
  });

  it('keeps yesterday’s streak while today has no mood yet', () => {
    expect(moodStreak([on(1, 2), on(2, 3)], now)).toBe(2);
  });

  it('is 0 when neither today nor yesterday has a mood', () => {
    expect(moodStreak([on(2, 3)], now)).toBe(0);
    expect(moodStreak([], now)).toBe(0);
  });
});

describe('longestStreak', () => {
  it('finds the longest run at any point', () => {
    expect(longestStreak([on(10, 1), on(9, 1), on(8, 1), on(8, 2), on(1, 3), on(0, 3)])).toBe(3);
  });

  it('is 0 with no moods', () => {
    expect(longestStreak([])).toBe(0);
  });
});

describe('mostCommonMood', () => {
  it('returns the mood logged most often', () => {
    expect(mostCommonMood(dailyMoods([on(0, 3), on(1, 3), on(2, 1)], 3, now))).toBe(3);
  });

  it('prefers the more recent mood on a tie', () => {
    expect(mostCommonMood(dailyMoods([on(0, 4), on(1, 1)], 2, now))).toBe(4);
  });

  it('is null with no moods', () => {
    expect(mostCommonMood(dailyMoods([], 7, now))).toBeNull();
  });
});

describe('currentWeek', () => {
  // 31 Oct 2026 is a Saturday.
  it('runs Monday to Sunday around today', () => {
    const week = currentWeek([on(0, 4), on(5, 1)], now);
    expect(week.map((d) => d.date.getDate())).toEqual([26, 27, 28, 29, 30, 31, 1]);
    expect(week.map((d) => d.mood)).toEqual([1, null, null, null, null, 4, null]);
    expect(week[5].isToday).toBe(true);
    expect(week[6].isFuture).toBe(true);
  });
});

describe('goodDayShare', () => {
  it('counts Good and Great as a share of logged days', () => {
    expect(goodDayShare(dailyMoods([on(0, 4), on(1, 3), on(2, 1)], 7, now))).toEqual({
      good: 2,
      logged: 3,
      percent: 67,
    });
  });

  it('is 0% with nothing logged', () => {
    expect(goodDayShare(dailyMoods([], 7, now)).percent).toBe(0);
  });
});

describe('moodInsight', () => {
  it('notices a better week than the last', () => {
    expect(moodInsight([on(10, 1), on(9, 1), on(1, 3), on(0, 4)], now)).toMatch(/better than last/);
  });

  it('points to the researcher after a harder week', () => {
    expect(moodInsight([on(10, 4), on(9, 4), on(1, 1), on(0, 1)], now)).toMatch(/researcher/);
  });

  it('notices brighter mornings', () => {
    const entries = [on(6, 4, 8), on(4, 4, 9), on(3, 1, 20), on(2, 1, 21)];
    expect(moodInsight(entries, now)).toMatch(/mornings/);
  });

  it('falls back to the streak, then to a general nudge, then to nothing', () => {
    expect(moodInsight([on(0, 2, 20), on(1, 2, 20), on(2, 2, 20)], now)).toMatch(/3 days/);
    expect(moodInsight([on(5, 2)], now)).toMatch(/spot patterns/);
    expect(moodInsight([], now)).toBeNull();
  });
});
