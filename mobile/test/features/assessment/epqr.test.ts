import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  EPQR_ITEMS,
  EPQR_KEY,
  WISHED_DEAD_INDEX,
  epqrMax,
  epqrScores,
  epqrSummary,
} from '@/features/assessment';
import {
  clearEpqrAnswers,
  getEpqrAnswers,
  getEpqrResult,
  saveEpqrOnPhone,
  setEpqrAnswer,
} from '@/features/assessment/store/epqrStore';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

describe('EPQ-R content', () => {
  it('has 100 questions, each scored on exactly one scale', () => {
    expect(EPQR_ITEMS).toHaveLength(100);
    const keyed = Object.values(EPQR_KEY).flatMap((k) => [...k.yes, ...k.no]);
    expect(keyed.sort((a, b) => a - b)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it('matches the published scale lengths', () => {
    expect([epqrMax('P'), epqrMax('E'), epqrMax('N'), epqrMax('L')]).toEqual([32, 23, 24, 21]);
  });

  it('flags question 76 as the warning question', () => {
    expect(EPQR_ITEMS[WISHED_DEAD_INDEX]).toBe('Have you ever wished that you were dead?');
  });
});

describe('EPQ-R scoring', () => {
  it('counts keyed answers on each scale', () => {
    const answers: boolean[] = Array(100).fill(false);
    // Yes to "Do you have many hobbies?" (E) and "Are you a worrier?" (N).
    answers[0] = true;
    answers[37] = true;
    const scores = epqrScores(answers);
    expect(scores.E).toBe(1 + EPQR_KEY.E.no.length);
    expect(scores.N).toBe(1);
    expect(scores.P).toBe(EPQR_KEY.P.no.length);
    expect(scores.L).toBe(EPQR_KEY.L.no.length);
    expect(epqrSummary(answers)).toBe(`E 4 · N 1 · P 19 · L 15`);
  });

  it('scores nothing for unanswered questions', () => {
    expect(epqrScores([])).toEqual({ P: 0, E: 0, N: 0, L: 0 });
  });
});

describe('EPQ-R answers', () => {
  it('keeps answers in progress until they’re cleared', () => {
    setEpqrAnswer(0, true);
    setEpqrAnswer(2, false);
    expect(getEpqrAnswers()).toEqual([true, undefined, false]);
    clearEpqrAnswers();
    expect(getEpqrAnswers()).toEqual([]);
  });

  it('keeps only what the server said, never scores', () => {
    const saved = { id: 'e1', needsSupport: true, takenAt: '2026-11-16T09:00:00.000Z' };
    saveEpqrOnPhone(saved);
    expect(getEpqrResult()).toEqual(saved);
  });
});
