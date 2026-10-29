import { describe, expect, it } from '@jest/globals';

import { calculateAge, toIsoDate } from '../src/lib/dates';

describe('calculateAge', () => {
  const today = new Date(2026, 9, 29);

  it('counts a birthday already passed this year', () => {
    expect(calculateAge(new Date(2005, 0, 15), today)).toBe(21);
  });

  it('does not count a birthday still to come this year', () => {
    expect(calculateAge(new Date(2005, 11, 1), today)).toBe(20);
  });

  it('counts the birthday on the day itself', () => {
    expect(calculateAge(new Date(2005, 9, 29), today)).toBe(21);
  });
});

describe('toIsoDate', () => {
  it('formats the local date with zero padding', () => {
    expect(toIsoDate(new Date(2005, 0, 5))).toBe('2005-01-05');
  });
});
