import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  getPhq9Mode,
  startPhq9,
  setAnswer,
  getAnswers,
  clearAnswers,
} from '@/features/assessment/store/assessmentStore';
import { getBaselinePhq9, getFinalPhq9, savePhq9OnPhone } from '@/features/assessment';
import {
  allPracticeDays,
  finalCheckInDue,
  needsSupport,
  phq9Outcome,
  sessionsFinished,
} from '@/features/endOfStudy/endOfStudy';
import type { PracticeData } from '@/features/homework/homework';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

const done = (at = '2026-10-01T10:00:00Z') => ({ done: [], completedAt: at });

describe('phq9Outcome', () => {
  it.each([
    [13, 7, 'lighter'],
    [13, 8, 'lighter'],
    [13, 9, 'same'],
    [13, 17, 'same'],
    [13, 18, 'heavier'],
  ] as const)('%i then %i is %s', (start, end, outcome) => {
    expect(phq9Outcome(start, end)).toBe(outcome);
  });

  it('offers support when things got worse or the final score is high', () => {
    expect(needsSupport(13, 18)).toBe(true);
    expect(needsSupport(24, 16)).toBe(true);
    expect(needsSupport(13, 7)).toBe(false);
  });
});

describe('finalCheckInDue', () => {
  it('opens once session 8 is done and closes once taken', () => {
    expect(finalCheckInDue({ 7: done() }, undefined)).toBe(false);
    expect(finalCheckInDue({ 8: done() }, undefined)).toBe(true);
    expect(finalCheckInDue({ 8: done() }, { score: 7, at: 'x', kind: 'final' })).toBe(false);
  });

  it('counts finished sessions', () => {
    expect(sessionsFinished({ 1: done(), 2: { done: ['a'] }, 3: done() })).toBe(2);
  });
});

function fromServer(kind: 'baseline' | 'final', score: number, takenAt: string) {
  return { id: kind, kind, score, band: 'Mild' as const, needsSupport: false, takenAt };
}

describe('final PHQ-9 storage', () => {
  it('keeps the baseline and the week-8 score apart', () => {
    savePhq9OnPhone(fromServer('baseline', 13, '2026-09-01T10:00:00.000Z'));
    savePhq9OnPhone(fromServer('final', 7, '2026-10-27T10:00:00.000Z'));
    expect(getBaselinePhq9()?.score).toBe(13);
    expect(getFinalPhq9()).toEqual({ score: 7, at: '2026-10-27T10:00:00.000Z', kind: 'final' });
  });

  it('keeps one final score, the one the server saved', () => {
    savePhq9OnPhone(fromServer('final', 7, '2026-10-27T10:00:00.000Z'));
    savePhq9OnPhone(fromServer('final', 7, '2026-10-27T10:00:00.000Z'));
    expect(getFinalPhq9()?.score).toBe(7);
  });

  it('starts the final questionnaire with no old answers, and resets the mode after', () => {
    setAnswer(0, 3);
    startPhq9('final');
    expect(getAnswers()).toEqual([]);
    expect(getPhq9Mode()).toBe('final');
    clearAnswers();
    expect(getPhq9Mode()).toBe('baseline');
  });
});

describe('allPracticeDays', () => {
  it('counts each day once across every session', () => {
    const data: PracticeData = {
      moods: [{ mood: 2, at: '2026-10-01T09:00:00' }],
      thoughts: [],
      plans: [],
      uses: [],
      stress: [],
      evidence: [],
      ticks: { 8: ['2026-10-01', '2026-10-05'] },
    };
    expect(allPracticeDays(data)).toBe(2);
  });
});
