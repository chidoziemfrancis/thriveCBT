import { describe, expect, it } from '@jest/globals';

import { weekOfStudy } from '@/features/home/studyWeek';

describe('weekOfStudy', () => {
  const start = new Date(2026, 9, 1, 18, 30).toISOString();

  it('is week 1 from the joining day through day 7', () => {
    expect(weekOfStudy(start, new Date(2026, 9, 1, 9))).toBe(1);
    expect(weekOfStudy(start, new Date(2026, 9, 7, 23))).toBe(1);
  });

  it('moves to the next week on day 8 regardless of the joining time', () => {
    expect(weekOfStudy(start, new Date(2026, 9, 8, 0, 5))).toBe(2);
    expect(weekOfStudy(start, new Date(2026, 9, 29))).toBe(5);
  });

  it('stays on the last week after the programme ends', () => {
    expect(weekOfStudy(start, new Date(2027, 0, 1))).toBe(8);
  });

  it('falls back to week 1 without a valid start date', () => {
    expect(weekOfStudy(undefined)).toBe(1);
    expect(weekOfStudy('not a date')).toBe(1);
  });
});
