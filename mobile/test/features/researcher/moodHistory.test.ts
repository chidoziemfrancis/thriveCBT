import { describe, expect, it } from '@jest/globals';

import { moodWeeks } from '@/features/researcher/moodHistory';

const now = new Date(2026, 10, 3, 13, 0);

function on(day: number, mood: number) {
  return { mood, at: new Date(2026, 10, day, 20).toISOString() };
}

describe('moodWeeks', () => {
  // Joined Mon 20 Oct, so week 1 is 20–26 Oct, week 2 is 27 Oct–2 Nov, week 3 starts 3 Nov.
  const joined = new Date(2026, 9, 20, 9).toISOString();

  it('splits moods into study weeks from the day they joined, newest first', () => {
    const weeks = moodWeeks(
      [on(3, 3), { mood: 1, at: new Date(2026, 9, 21, 20).toISOString() }],
      joined,
      now
    );
    expect(weeks.map((w) => w.week)).toEqual([3, 2, 1]);
    expect(weeks[2].start).toEqual(new Date(2026, 9, 20));
    expect(weeks[2].end).toEqual(new Date(2026, 9, 26));
    expect(weeks[2].days[1].mood).toBe(1);
    expect(weeks[0].days[0].mood).toBe(3);
  });

  it('marks days still to come and leaves them empty', () => {
    const [current] = moodWeeks([], joined, now);
    expect(current.days[0].future).toBe(false);
    expect(current.days.slice(1).every((d) => d.future && d.mood === null)).toBe(true);
  });

  it('gives each week the mood logged most often, or null', () => {
    const moods = [27, 28, 29].map((d) => ({
      mood: 1,
      at: new Date(2026, 9, d, 20).toISOString(),
    }));
    const weeks = moodWeeks(
      [...moods, { mood: 3, at: new Date(2026, 9, 30, 20).toISOString() }],
      joined,
      now
    );
    expect(weeks[1].mostOften).toBe(1);
    expect(weeks[2].mostOften).toBeNull();
  });

  it('has a single week for someone who joined today', () => {
    expect(moodWeeks([], now.toISOString(), now)).toHaveLength(1);
  });
});
