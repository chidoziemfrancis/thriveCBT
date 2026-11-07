import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { type MoodEntry, moodNotes } from '@/features/mood/moodLog';
import { getMoodLog, logMood, setTodaysMoodNote, todaysMood } from '@/features/mood/moodStore';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

const morning = new Date(2026, 10, 7, 9);
const evening = new Date(2026, 10, 7, 20);

describe('today’s mood note', () => {
  it('adds a trimmed note to today’s mood, and a blank one removes it', () => {
    logMood(1, morning);
    expect(setTodaysMoodNote('  Exams on Monday ', morning)?.note).toBe('Exams on Monday');
    expect(todaysMood(morning)?.note).toBe('Exams on Monday');
    setTodaysMoodNote('   ', morning);
    expect(todaysMood(morning)?.note).toBeUndefined();
  });

  it('keeps the note when the student changes today’s face', () => {
    logMood(1, morning);
    setTodaysMoodNote('Rough start', morning);
    logMood(3, evening);
    expect(todaysMood(evening)).toMatchObject({ mood: 3, note: 'Rough start' });
  });

  it('does nothing before a mood is logged today', () => {
    expect(setTodaysMoodNote('Hello', morning)).toBeNull();
    expect(getMoodLog()).toEqual([]);
  });
});

describe('moodNotes', () => {
  const entry = (day: number, hour: number, mood: number, note?: string): MoodEntry => ({
    mood,
    at: new Date(2026, 10, day, hour).toISOString(),
    ...(note ? { note } : {}),
  });

  it('lists notes newest first, using each day’s latest mood', () => {
    const entries = [
      entry(3, 9, 1, 'Old note'),
      entry(4, 9, 2, 'Replaced later that day'),
      entry(4, 20, 3),
      entry(5, 9, 2, 'Newest'),
    ];
    expect(moodNotes(entries).map((e) => e.note)).toEqual(['Newest', 'Old note']);
  });

  it('stops at the limit', () => {
    const entries = [1, 2, 3, 4].map((d) => entry(d, 9, 2, `Day ${d}`));
    expect(moodNotes(entries, 2).map((e) => e.note)).toEqual(['Day 4', 'Day 3']);
  });
});
