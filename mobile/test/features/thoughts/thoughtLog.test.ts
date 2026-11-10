import { describe, expect, it, jest } from '@jest/globals';

import { RECORD_RECAP } from '@/features/thoughts/recordSteps';
import { type ThoughtRecord, recordFromDiary, trapCounts } from '@/features/thoughts/thoughtLog';
import { addThoughtRecord } from '@/features/thoughts/thoughtLogStore';

// The store reads storage as soon as it loads, so the mock keeps its own memory.
jest.mock('@/lib/storage', () => {
  const memory = new Map<string, unknown>();
  return {
    memory,
    readJson: (key: string, fallback: unknown) => (memory.has(key) ? memory.get(key) : fallback),
    writeJson: (key: string, value: unknown) => memory.set(key, value),
    removeKey: (key: string) => memory.delete(key),
  };
});
const { memory } = jest.requireMock<{ memory: Map<string, unknown> }>('@/lib/storage');

const now = new Date(2026, 10, 20, 12);
const record = (daysAgo: number, traps: string[]): ThoughtRecord => ({
  id: `t${daysAgo}`,
  at: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(),
  situation: 'Something',
  thought: 'A thought',
  feeling: ['sad', 'Down', '50'],
  traps,
});

describe('recordFromDiary', () => {
  it('builds a record from the answers, and nothing without a situation', () => {
    expect(
      recordFromDiary(RECORD_RECAP, {
        'record-situation': ' At home ',
        'record-thought': 'I’m a burden',
        'record-feeling': ['sad', 'Hopeless', '80'],
        'record-traps': ['all-or-nothing'],
      })
    ).toEqual({
      situation: 'At home',
      thought: 'I’m a burden',
      feeling: ['sad', 'Hopeless', '80'],
      action: undefined,
      traps: ['all-or-nothing'],
    });
    expect(recordFromDiary(RECORD_RECAP, {})).toBeNull();
  });
});

describe('trapCounts', () => {
  it('counts this week’s traps, most frequent first, and ignores older records', () => {
    const counts = trapCounts(
      [
        record(1, ['mind-reading']),
        record(2, ['mind-reading', 'catastrophising']),
        record(3, ['not-sure']),
        record(10, ['catastrophising', 'catastrophising']),
      ],
      now
    );
    expect(counts.map((c) => [c.id, c.count])).toEqual([
      ['mind-reading', 2],
      ['catastrophising', 1],
    ]);
  });
});

describe('thought log store', () => {
  it('keeps records newest first', () => {
    const first = addThoughtRecord(record(0, []), new Date(2026, 10, 1));
    const second = addThoughtRecord(record(0, []), new Date(2026, 10, 2));
    const saved = memory.get('thought_log') as ThoughtRecord[];
    expect(saved.map((r) => r.id)).toEqual([second.id, first.id]);
  });
});
