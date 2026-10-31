import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { daysAgoLabel, excerpt, groupByWeek } from '@/features/journal/journalLogic';
import { JOURNAL_PROMPTS, promptIndexForDay } from '@/features/journal/journalPrompts';
import type { JournalEntry } from '@/features/journal/journalStore';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

// The store reads storage when it loads, so each test gets a fresh copy.
function loadStore() {
  let store!: typeof import('@/features/journal/journalStore');
  jest.isolateModules(() => {
    store = require('@/features/journal/journalStore');
  });
  return store;
}

beforeEach(() => mockMemory.clear());

// 31 Oct 2026 is a Saturday.
const now = new Date(2026, 9, 31, 12, 0);

function entry(daysAgo: number, id = `e${daysAgo}`): JournalEntry {
  return { id, text: 'x', at: new Date(2026, 9, 31 - daysAgo, 9).toISOString() };
}

describe('journal store', () => {
  it('adds, edits and deletes entries', () => {
    const store = loadStore();
    const created = store.addJournalEntry(
      { prompt: 'How was today?', text: 'Okay', mood: 2 },
      new Date('2026-10-30T09:00:00Z')
    );
    expect(store.getJournal()).toHaveLength(1);

    store.updateJournalEntry(
      created.id,
      { text: 'Better', mood: 3 },
      new Date('2026-10-31T09:00:00Z')
    );
    expect(store.getJournalEntry(created.id)).toMatchObject({
      text: 'Better',
      mood: 3,
      prompt: 'How was today?',
      editedAt: '2026-10-31T09:00:00.000Z',
    });

    store.deleteJournalEntry(created.id);
    expect(store.getJournal()).toEqual([]);
  });

  it('keeps entries across a reload', () => {
    loadStore().addJournalEntry({ text: 'Kept' });
    expect(
      loadStore()
        .getJournal()
        .map((e) => e.text)
    ).toEqual(['Kept']);
  });

  it('saves and clears a draft', () => {
    const store = loadStore();
    store.saveJournalDraft({ prompt: 'P', text: 'half a thought', mood: 1 });
    expect(store.getJournalDraft()).toEqual({ prompt: 'P', text: 'half a thought', mood: 1 });
    store.clearJournalDraft();
    expect(store.getJournalDraft()).toBeNull();
  });
});

describe('groupByWeek', () => {
  it('groups newest first into this week, last week and older weeks', () => {
    const groups = groupByWeek([entry(20), entry(0), entry(5), entry(8), entry(1)], now);
    expect(groups.map((g) => g.title)).toEqual([
      'This week',
      'Last week',
      expect.stringMatching(/^Week of/),
    ]);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['e0', 'e1', 'e5']);
    expect(groups[1].entries.map((e) => e.id)).toEqual(['e8']);
  });

  it('is empty with no entries', () => {
    expect(groupByWeek([], now)).toEqual([]);
  });
});

describe('excerpt', () => {
  it('leaves short text alone and flattens line breaks', () => {
    expect(excerpt('One\n\ntwo  three')).toBe('One two three');
  });

  it('cuts long text at a word boundary', () => {
    const text =
      'I felt tired this morning but the walk to class helped more than I thought it would';
    const short = excerpt(text, 40);
    expect(short).toBe('I felt tired this morning but the walk…');
    expect(short.length).toBeLessThanOrEqual(41);
  });
});

describe('daysAgoLabel', () => {
  it('reads naturally for recent days', () => {
    expect(daysAgoLabel(entry(0).at, now)).toBe('today');
    expect(daysAgoLabel(entry(1).at, now)).toBe('yesterday');
    expect(daysAgoLabel(entry(4).at, now)).toBe('4 days ago');
    expect(daysAgoLabel(entry(10).at, now)).not.toMatch(/ago/);
  });
});

describe('prompts', () => {
  it('keeps one prompt all day and moves on the next day', () => {
    const morning = promptIndexForDay(new Date(2026, 9, 31, 0, 5));
    expect(promptIndexForDay(new Date(2026, 9, 31, 23, 55))).toBe(morning);
    expect(promptIndexForDay(new Date(2026, 10, 1, 9))).toBe(
      (morning + 1) % JOURNAL_PROMPTS.length
    );
  });
});
