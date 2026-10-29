import { describe, expect, it } from '@jest/globals';

import {
  OLDEST_BIRTH_AGE,
  YOUNGEST_BIRTH_AGE,
  birthYears,
  calculateAge,
  clampDay,
  daysInMonth,
  parseIsoDate,
  toIsoDate,
} from '@/lib/dates';

const today = new Date(2026, 9, 29);

describe('calculateAge', () => {
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

describe('toIsoDate and parseIsoDate', () => {
  it('formats the local date with zero padding', () => {
    expect(toIsoDate(new Date(2005, 0, 5))).toBe('2005-01-05');
  });

  it('round-trips a stored date into local parts without shifting the day', () => {
    expect(parseIsoDate('2005-01-05')).toEqual({ year: 2005, month: 0, day: 5 });
    expect(parseIsoDate(toIsoDate(new Date(2004, 1, 29)))).toEqual({
      year: 2004,
      month: 1,
      day: 29,
    });
  });

  it('returns empty parts for missing or malformed input', () => {
    expect(parseIsoDate(undefined)).toEqual({});
    expect(parseIsoDate('15/01/2005')).toEqual({});
  });
});

describe('daysInMonth', () => {
  it.each([
    [2005, 0, 31],
    [2005, 3, 30],
    [2005, 1, 28],
    [2004, 1, 29],
    [2000, 1, 29],
    [1900, 1, 28],
  ])('%i month %i has %i days', (year, month, days) => {
    expect(daysInMonth(year, month)).toBe(days);
  });
});

describe('clampDay', () => {
  it('rolls a day back to the last day of a shorter month', () => {
    expect(clampDay(2005, 3, 31)).toBe(30);
    expect(clampDay(2005, 1, 31)).toBe(28);
    expect(clampDay(2004, 1, 31)).toBe(29);
  });

  it('keeps a day that still exists', () => {
    expect(clampDay(2005, 0, 31)).toBe(31);
    expect(clampDay(2005, 1, 14)).toBe(14);
  });
});

describe('birthYears', () => {
  it('runs oldest to youngest and never reaches a future year', () => {
    const years = birthYears(today);
    expect(years[0]).toBe(2026 - OLDEST_BIRTH_AGE);
    expect(years[years.length - 1]).toBe(2026 - YOUNGEST_BIRTH_AGE);
    expect(years).toHaveLength(OLDEST_BIRTH_AGE - YOUNGEST_BIRTH_AGE + 1);
  });
});
