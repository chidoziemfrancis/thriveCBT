import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { Call } from '@/features/researcher/caseload';
import {
  AVAILABILITY,
  REPEAT_WEEKS,
  allCalls,
  bookableDays,
  dayLabel,
  expandBookings,
  slotsForDay,
  upcomingByDay,
} from '@/features/researcher/schedule';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

// Monday 3 November 2026, 1pm.
const now = new Date(2026, 10, 3, 13, 0);

function call(id: string, day: number, hour: number, minute = 0): Call {
  return {
    id,
    studentId: 's1',
    startsAt: new Date(2026, 10, day, hour, minute).toISOString(),
    durationMin: 30,
  };
}

describe('expandBookings', () => {
  const booking = {
    id: 'b1',
    studentId: 's1',
    startsAt: new Date(2026, 10, 5, 14).toISOString(),
    durationMin: 30,
    note: 'How did week 2 go?',
  };

  it('turns a weekly booking into one call a week, same time', () => {
    const calls = expandBookings([{ ...booking, weekly: true }]);
    expect(calls).toHaveLength(REPEAT_WEEKS);
    expect(calls.map((c) => new Date(c.startsAt).getDate()).slice(0, 3)).toEqual([5, 12, 19]);
    expect(calls.every((c) => new Date(c.startsAt).getHours() === 14)).toBe(true);
    expect(new Set(calls.map((c) => c.id)).size).toBe(REPEAT_WEEKS);
    expect(calls[0].note).toBe('How did week 2 go?');
  });

  it('keeps a one-off booking as a single call', () => {
    expect(expandBookings([{ ...booking, weekly: false }])).toHaveLength(1);
  });
});

describe('allCalls', () => {
  it('merges booked calls with existing ones, drops cancelled ones, and sorts by time', () => {
    const existing = [call('late', 6, 15), call('gone', 4, 9)];
    const booked = [
      {
        id: 'b1',
        studentId: 's2',
        startsAt: call('x', 5, 10).startsAt,
        durationMin: 30,
        weekly: false,
      },
    ];
    expect(
      allCalls(existing, booked, ['gone']).map((c) => c.studentId + c.startsAt.slice(8, 10))
    ).toEqual(['s2' + booked[0].startsAt.slice(8, 10), 's1' + existing[0].startsAt.slice(8, 10)]);
  });
});

describe('bookableDays', () => {
  it('offers working days only, starting today', () => {
    const days = bookableDays(now);
    expect(days[0]).toEqual(new Date(2026, 10, 3));
    expect(days.every((d) => AVAILABILITY.days.includes(d.getDay()))).toBe(true);
    expect(days).toHaveLength(10);
  });
});

describe('slotsForDay', () => {
  it('offers half-hour slots in working hours, skipping ones already started today', () => {
    const slots = slotsForDay(new Date(2026, 10, 3), [], now);
    expect(slots[0].start).toEqual(new Date(2026, 10, 3, 13, 30));
    expect(slots[slots.length - 1].start).toEqual(new Date(2026, 10, 3, 16, 30));
  });

  it('marks slots that overlap a call as taken, so nothing is double-booked', () => {
    const day = new Date(2026, 10, 4);
    const slots = slotsForDay(day, [call('c1', 4, 10, 15)], now);
    const taken = slots
      .filter((s) => s.taken)
      .map((s) => s.start.getHours() * 60 + s.start.getMinutes());
    expect(taken).toEqual([10 * 60, 10 * 60 + 30]);
  });

  it('lets a call being moved ignore its own slot', () => {
    const slots = slotsForDay(new Date(2026, 10, 4), [call('c1', 4, 10)], now, 'c1');
    expect(slots.some((s) => s.taken)).toBe(false);
  });
});

describe('upcomingByDay', () => {
  it('groups calls that are not over by day, earliest first', () => {
    const groups = upcomingByDay(
      [call('a', 5, 9), call('past', 3, 9), call('b', 3, 15), call('c', 5, 8)],
      now
    );
    expect(groups.map((g) => g.date.getDate())).toEqual([3, 5]);
    expect(groups[1].calls.map((c) => c.id)).toEqual(['c', 'a']);
  });

  it('leaves out calls beyond the window', () => {
    expect(upcomingByDay([call('far', 30, 9)], now)).toEqual([]);
  });
});

describe('dayLabel', () => {
  it('reads as today, tomorrow or a date', () => {
    expect(dayLabel(new Date(2026, 10, 3, 18), now)).toBe('Today');
    expect(dayLabel(new Date(2026, 10, 4, 9), now)).toBe('Tomorrow');
    expect(dayLabel(new Date(2026, 10, 6, 9), now)).not.toMatch(/Today|Tomorrow/);
  });
});

describe('schedule store', () => {
  it('saves bookings and cancellations', () => {
    jest.isolateModules(() => {
      const store =
        require('@/features/researcher/scheduleStore') as typeof import('@/features/researcher/scheduleStore');
      const booking = store.addBooking(
        { studentId: 's1', startsAt: call('x', 5, 10).startsAt, durationMin: 30, weekly: true },
        now
      );
      store.cancelCall('seed-s1');
      store.cancelCall('seed-s1');
      expect(mockMemory.get('researcher_schedule')).toEqual({
        bookings: [booking],
        cancelled: ['seed-s1'],
      });
    });
  });
});
