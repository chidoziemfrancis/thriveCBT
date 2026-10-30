import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  CheckIn,
  checkInPhase,
  countdownLabel,
  formatDuration,
  rollForward,
} from '@/features/checkin/checkinLogic';
import { completeCheckIn, getNextCheckIn } from '@/features/checkin/checkinStore';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

const start = new Date(2026, 9, 29, 16, 0);
const checkIn: CheckIn = {
  id: 'c1',
  researcherId: 'r-tunde',
  startsAt: start.toISOString(),
  durationMin: 30,
};
const at = (minutesFromStart: number) => new Date(start.getTime() + minutesFromStart * 60_000);

describe('checkInPhase', () => {
  it('opens 10 minutes early and closes when the slot ends', () => {
    expect(checkInPhase(checkIn, at(-11))).toBe('upcoming');
    expect(checkInPhase(checkIn, at(-10))).toBe('joinable');
    expect(checkInPhase(checkIn, at(15))).toBe('joinable');
    expect(checkInPhase(checkIn, at(30))).toBe('joinable');
    expect(checkInPhase(checkIn, at(31))).toBe('ended');
  });
});

describe('rollForward', () => {
  it('leaves an upcoming or joinable check-in alone', () => {
    expect(rollForward(checkIn, at(-60))).toBe(checkIn);
    expect(rollForward(checkIn, at(10))).toBe(checkIn);
  });

  it('moves a missed check-in to the same time next week', () => {
    const next = rollForward(checkIn, at(31));
    expect(new Date(next.startsAt).getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    expect(next.id).not.toBe(checkIn.id);
  });

  it('skips every week that has already passed', () => {
    const threeWeeksLater = at(3 * 7 * 24 * 60 + 60);
    const next = rollForward(checkIn, threeWeeksLater);
    expect(checkInPhase(next, threeWeeksLater)).toBe('upcoming');
    expect(new Date(next.startsAt).getDay()).toBe(start.getDay());
    expect(new Date(next.startsAt).getHours()).toBe(16);
  });
});

describe('countdownLabel', () => {
  it('uses the most natural unit', () => {
    expect(countdownLabel(checkIn.startsAt, at(-12))).toBe('Starts in 12 min');
    expect(countdownLabel(checkIn.startsAt, at(-60))).toBe('Starts in 1 hour');
    expect(countdownLabel(checkIn.startsAt, at(-5 * 60))).toBe('Starts in 5 hours');
    expect(countdownLabel(checkIn.startsAt, at(-2 * 24 * 60))).toBe('Starts in 2 days');
    expect(countdownLabel(checkIn.startsAt, at(1))).toBe('Happening now');
  });
});

describe('formatDuration', () => {
  it('shows minutes and zero-padded seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(1421)).toBe('23:41');
  });
});

describe('mock check-in schedule', () => {
  it('has no check-in until a researcher is assigned', () => {
    expect(getNextCheckIn(undefined)).toBeNull();
  });

  it('creates one a few minutes out, so it can be joined right away, and keeps it', () => {
    const now = new Date(2026, 9, 29, 9, 0);
    const first = getNextCheckIn('r-tunde', now);
    expect(first && checkInPhase(first, now)).toBe('joinable');
    expect(getNextCheckIn('r-tunde', new Date(2026, 9, 29, 9, 2))).toEqual(first);
  });

  it('rolls a missed mock check-in forward instead of staying stuck', () => {
    const first = getNextCheckIn('r-tunde', new Date(2026, 9, 29, 9, 0))!;
    const later = new Date(2026, 9, 30, 12, 0);
    const next = getNextCheckIn('r-tunde', later)!;
    expect(checkInPhase(next, later)).toBe('upcoming');
    expect(new Date(next.startsAt).getTime() - new Date(first.startsAt).getTime()).toBe(
      7 * 24 * 60 * 60 * 1000
    );
  });

  it('books the same slot next week after the call, and keeps the feedback', () => {
    const first = getNextCheckIn('r-tunde', new Date(2026, 9, 29, 9, 0))!;
    completeCheckIn(first, { rating: 3, callSeconds: 1200 }, new Date(2026, 9, 29, 9, 30));

    const next = getNextCheckIn('r-tunde')!;
    expect(new Date(next.startsAt).getTime() - new Date(first.startsAt).getTime()).toBe(
      7 * 24 * 60 * 60 * 1000
    );
    expect(next.id).not.toBe(first.id);
    expect(mockMemory.get('checkin_feedback')).toEqual([
      expect.objectContaining({ checkInId: first.id, rating: 3, callSeconds: 1200 }),
    ]);
  });
});
