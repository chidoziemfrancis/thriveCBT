import { describe, expect, it } from '@jest/globals';

import { moodToRotation, pointOnArc, rotationToMood, touchToRotation } from '@/features/mood/gauge';
import { moodOnDay } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';

const count = MOODS.length;

describe('gauge maths', () => {
  it('maps touches above the centre to a rotation from left (0) to right (180)', () => {
    expect(touchToRotation(-100, 0.0001)).toBeCloseTo(0, 1);
    expect(touchToRotation(0, 100)).toBeCloseTo(90);
    expect(touchToRotation(100, 0.0001)).toBeCloseTo(180, 1);
  });

  it('pins touches below the centre line to the nearest end', () => {
    expect(touchToRotation(-20, -40)).toBe(0);
    expect(touchToRotation(20, -40)).toBe(180);
  });

  it('splits the half circle evenly between the moods', () => {
    expect(rotationToMood(0, count)).toBe(0);
    expect(rotationToMood(35.9, count)).toBe(0);
    expect(rotationToMood(36, count)).toBe(1);
    expect(rotationToMood(90, count)).toBe(2);
    expect(rotationToMood(180, count)).toBe(count - 1);
  });

  it('rests the needle in the middle of each mood', () => {
    expect(moodToRotation(0, count)).toBe(18);
    expect(moodToRotation(2, count)).toBe(90);
    MOODS.forEach((_, mood) =>
      expect(rotationToMood(moodToRotation(mood, count), count)).toBe(mood)
    );
  });

  it('places arc points left, top and right of the centre', () => {
    const left = pointOnArc(100, 100, 50, 0);
    const top = pointOnArc(100, 100, 50, 90);
    expect(left.x).toBeCloseTo(50);
    expect(left.y).toBeCloseTo(100);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);
  });
});

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
