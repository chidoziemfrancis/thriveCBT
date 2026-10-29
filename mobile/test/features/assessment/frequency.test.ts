import { describe, expect, it } from '@jest/globals';

import {
  DAYS_IN_WINDOW,
  FREQUENCY_COLORS,
  illustratedDays,
  stopForPosition,
} from '@/features/assessment/frequency';
import { PHQ9_OPTIONS } from '@/features/assessment/phq9';

describe('stopForPosition', () => {
  const width = 300;

  it('snaps to the nearest of the 4 answer stops', () => {
    expect(stopForPosition(0, width, 4)).toBe(0);
    expect(stopForPosition(49, width, 4)).toBe(0);
    expect(stopForPosition(51, width, 4)).toBe(1);
    expect(stopForPosition(150, width, 4)).toBe(2);
    expect(stopForPosition(300, width, 4)).toBe(3);
  });

  it('clamps drags past either end of the track', () => {
    expect(stopForPosition(-80, width, 4)).toBe(0);
    expect(stopForPosition(900, width, 4)).toBe(3);
  });

  it('falls back to the first stop before the track is measured', () => {
    expect(stopForPosition(120, 0, 4)).toBe(0);
  });
});

describe('illustratedDays', () => {
  it('shows no days before an answer is chosen', () => {
    expect(illustratedDays(null)).toBe(0);
  });

  // "More than half the days" must look like more than half of 14, and so on up the scale.
  it('grows with each answer and stays within the 2-week window', () => {
    const days = PHQ9_OPTIONS.map((option) => illustratedDays(option.value));
    expect(days[0]).toBe(0);
    expect(days[2]).toBeGreaterThan(DAYS_IN_WINDOW / 2);
    expect(days[3]).toBeLessThanOrEqual(DAYS_IN_WINDOW);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
  });

  it('has a colour for every answer', () => {
    expect(FREQUENCY_COLORS).toHaveLength(PHQ9_OPTIONS.length);
  });
});
