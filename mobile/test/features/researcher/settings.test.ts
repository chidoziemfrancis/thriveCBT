import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

function loadStore() {
  let store!: typeof import('@/features/researcher/settingsStore');
  jest.isolateModules(() => {
    store = require('@/features/researcher/settingsStore');
  });
  return store;
}

describe('researcher settings', () => {
  it('starts with Monday to Friday, 9 to 5, and notifications on', () => {
    const store = loadStore();
    store.updateSettings({});
    const saved = mockMemory.get('researcher_settings') as {
      hours: Record<number, { on: boolean }>;
      notify: { messages: boolean; calls: boolean };
    };
    expect([0, 1, 2, 3, 4, 5, 6].map((d) => saved.hours[d].on)).toEqual([
      false,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(saved.notify).toEqual({ messages: true, calls: true });
  });

  it('changes one day without touching the others, and keeps it after a reload', () => {
    loadStore().setDayHours(3, { end: 13 * 60 });
    loadStore().setDayHours(6, { on: true });
    const saved = mockMemory.get('researcher_settings') as {
      hours: Record<number, { on: boolean; start: number; end: number }>;
    };
    expect(saved.hours[3]).toEqual({ on: true, start: 540, end: 780 });
    expect(saved.hours[6].on).toBe(true);
    expect(saved.hours[1].end).toBe(1020);
  });

  it('saves profile changes and notification switches', () => {
    const store = loadStore();
    store.updateSettings({ capacity: 15, accepting: false, bio: 'Hi' });
    store.setNotify('calls', false);
    expect(mockMemory.get('researcher_settings')).toMatchObject({
      capacity: 15,
      accepting: false,
      bio: 'Hi',
      notify: { messages: true, calls: false },
    });
  });
});
