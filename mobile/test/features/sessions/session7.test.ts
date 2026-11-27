import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { readArrow, writeArrow } from '@/features/beliefs/utils/beliefs';
import { summariseSession } from '@/features/researcher/sessionSummary';
import { sessionContent } from '@/features/sessions/content';
import { SESSION_7 } from '@/features/sessions/content/session7';
import type { RecapStep } from '@/features/sessions/content/types';
import { compassionLines, isStepReady } from '@/features/sessions/utils/sessionLogic';

const mockMemory = new Map<string, unknown>();
let mockId = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: () => `00000000-0000-4000-8000-${String(++mockId).padStart(12, '0')}`,
}));
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

function loadStore() {
  let store!: typeof import('@/features/beliefs/store/positiveLogStore');
  jest.isolateModules(() => {
    store = require('@/features/beliefs/store/positiveLogStore');
  });
  return store;
}

beforeEach(() => mockMemory.clear());

const steps = SESSION_7.modules.flatMap((m) => m.steps);
const find = (id: string) => steps.find((s) => s.id === id)!;

describe('session 7 content', () => {
  it('is registered with its five parts and unique step ids', () => {
    expect(sessionContent(7)).toBe(SESSION_7);
    expect(SESSION_7.modules.map((m) => m.id)).toEqual([
      'roots',
      'find',
      'new',
      'evidence',
      'kind',
    ]);
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SESSION_7.practiceAction).toBe('evidence');
  });

  it('puts the tree’s three levels on the tree, top to bottom', () => {
    const tree = find('tree');
    expect(tree.kind === 'reveal' && tree.figure).toBe('tree');
    expect(tree.kind === 'reveal' && tree.cards.map((c) => c.id)).toEqual([
      'leaves',
      'branches',
      'roots',
    ]);
  });
});

describe('the downward arrow', () => {
  it('keeps the thought, each level and the belief', () => {
    const saved = writeArrow(
      'I failed',
      ['I’m not clever', 'I’ll never get anywhere'],
      'I’m a failure'
    );
    expect(readArrow(saved)).toEqual({
      thought: 'I failed',
      levels: ['I’m not clever', 'I’ll never get anywhere'],
      belief: 'I’m a failure',
    });
  });

  it('needs the belief named before moving on', () => {
    const arrow = find('my-arrow');
    expect(isStepReady(arrow, writeArrow('I failed', ['I’m not clever']))).toBe(false);
    expect(isStepReady(arrow, writeArrow('I failed', [], 'I’m a failure'))).toBe(true);
  });

  it('shows the researcher the thought, the levels and the belief', () => {
    const part = summariseSession(SESSION_7, {
      done: ['find'],
      answers: {
        'my-arrow': writeArrow('I failed', ['I’m not clever'], 'I’m a failure'),
        'old-belief': 90,
      },
    }).find((p) => p.id === 'find')!;
    expect(part.lines).toEqual([
      { label: 'Starting thought', value: 'I failed' },
      { label: 'Went deeper', value: 'I’m not clever' },
      { label: 'Core belief', value: 'I’m a failure' },
      { label: 'How much do you believe it right now?', value: '90%' },
    ]);
  });
});

describe('self-compassion', () => {
  it('reads the student’s words back once both are written', () => {
    const recap = find('kind-recap') as RecapStep;
    expect(compassionLines(recap, { hard: 'Money.' })).toBeNull();
    expect(
      compassionLines(recap, { hard: 'Money.', 'kind-words': 'You’re doing your best.' })
    ).toEqual([
      'This is hard: Money.',
      'I’m not the only one who feels like this.',
      'You’re doing your best.',
    ]);
  });
});

describe('positive data log', () => {
  it('adds entries newest first and skips blanks and repeats', () => {
    const store = loadStore();
    store.addPositive(
      [
        { kind: 'strength', text: 'Loyal friend' },
        { kind: 'win', text: ' ' },
      ],
      new Date('2026-11-16T09:00:00Z')
    );
    store.addPositive(
      [
        { kind: 'strength', text: 'Loyal friend' },
        { kind: 'kind', text: 'Ada saved me food' },
      ],
      new Date('2026-11-17T09:00:00Z')
    );
    expect(store.getPositiveLog().map((e) => e.text)).toEqual([
      'Ada saved me food',
      'Loyal friend',
    ]);
    store.removePositive(store.getPositiveLog()[0].id);
    expect(store.getPositiveLog()).toHaveLength(1);
  });
});
