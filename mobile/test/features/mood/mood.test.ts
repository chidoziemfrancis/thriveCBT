import { describe, expect, it } from '@jest/globals';

import { moodOnDay } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';

const count = MOODS.length;

describe('moodOnDay', () => {
  const day = new Date(2026, 9, 29, 12);

  it('returns the latest entry from that day', () => {
    const entries = [
      { mood: 1, at: new Date(2026, 9, 28, 20).toISOString() },
      { mood: 2, at: new Date(2026, 9, 29, 8).toISOString() },
      { mood: 4, at: new Date(2026, 9, 29, 18).toISOString() },
    ];
    expect(moodOnDay(entries, day)?.mood).toBe(4);
  });

  it('returns null when nothing was logged that day', () => {
    expect(moodOnDay([{ mood: 3, at: new Date(2026, 9, 28).toISOString() }], day)).toBeNull();
    expect(moodOnDay([], day)).toBeNull();
  });
});
