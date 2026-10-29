import { describe, expect, it } from '@jest/globals';

import {
  calculateAge,
  daysInMonth,
  isFutureDate,
  leadingBlanks,
  parseIsoDate,
  toIsoDate,
  withValidDay,
} from '../src/lib/dates';

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

describe('leadingBlanks', () => {
  it('counts blank cells before day 1 in a Monday-first grid', () => {
    expect(leadingBlanks(2026, 5)).toBe(0); // 1 June 2026 is a Monday
    expect(leadingBlanks(2026, 10)).toBe(6); // 1 November 2026 is a Sunday
    expect(leadingBlanks(2026, 9)).toBe(3); // 1 October 2026 is a Thursday
  });
});

describe('isFutureDate', () => {
  it('allows today and the past, rejects tomorrow', () => {
    expect(isFutureDate(2026, 9, 29, today)).toBe(false);
    expect(isFutureDate(2005, 0, 1, today)).toBe(false);
    expect(isFutureDate(2026, 9, 30, today)).toBe(true);
  });
});

describe('withValidDay', () => {
  it('drops a day that no longer exists after the month changes', () => {
    expect(withValidDay({ year: 2005, month: 3, day: 31 })).toEqual({ year: 2005, month: 3 });
    expect(withValidDay({ year: 2005, month: 1, day: 29 })).toEqual({ year: 2005, month: 1 });
  });

  it('keeps a day that is still valid, and leaves partial dates alone', () => {
    expect(withValidDay({ year: 2004, month: 1, day: 29 })).toEqual({
      year: 2004,
      month: 1,
      day: 29,
    });
    expect(withValidDay({ year: 2005 })).toEqual({ year: 2005 });
  });
});
