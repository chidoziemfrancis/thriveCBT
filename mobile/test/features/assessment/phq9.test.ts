import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  PHQ9_OPTIONS,
  PHQ9_QUESTIONS,
  SUICIDAL_IDEATION_INDEX,
  phq9Score,
  severityBand,
} from '@/features/assessment';
import {
  getBaselinePhq9,
  getFinalPhq9,
  getPhq9Scores,
  savePhq9OnPhone,
} from '@/features/assessment';

const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
}));

beforeEach(() => mockMemory.clear());

describe('severityBand', () => {
  it.each([
    [0, 'Minimal'],
    [4, 'Minimal'],
    [5, 'Mild'],
    [9, 'Mild'],
    [10, 'Moderate'],
    [14, 'Moderate'],
    [15, 'Moderately severe'],
    [19, 'Moderately severe'],
    [20, 'Severe'],
    [27, 'Severe'],
  ])('scores %i as %s', (score, band) => {
    expect(severityBand(score)).toBe(band);
  });
});

describe('PHQ-9 definition', () => {
  it('has the 9 standard questions scored 0 to 3', () => {
    expect(PHQ9_QUESTIONS).toHaveLength(9);
    expect(PHQ9_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3]);
  });

  // The crisis screen keys off this index, so it must stay on the self-harm question.
  it('flags the last question as the suicidal ideation item', () => {
    expect(SUICIDAL_IDEATION_INDEX).toBe(8);
    expect(PHQ9_QUESTIONS[SUICIDAL_IDEATION_INDEX]).toMatch(/hurting yourself/);
  });
});

describe('phq9Score', () => {
  it('adds up the answers', () => {
    expect(phq9Score([1, 2, 0, 3, 1, 0, 2, 1, 0])).toBe(10);
  });

  it('counts unanswered questions as 0', () => {
    expect(phq9Score([2, undefined, 1])).toBe(3);
    expect(phq9Score([])).toBe(0);
  });
});

describe('PHQ-9 phone copy', () => {
  const result = (kind: 'baseline' | 'final', score: number, takenAt: string) => ({
    id: kind,
    kind,
    score,
    band: 'Mild' as const,
    needsSupport: false,
    takenAt,
  });

  it('keeps the server’s baseline and final, each once, baseline first', () => {
    savePhq9OnPhone(result('final', 8, '2026-10-27T10:00:00.000Z'));
    savePhq9OnPhone(result('baseline', 14, '2026-09-01T10:00:00.000Z'));
    savePhq9OnPhone(result('baseline', 14, '2026-09-01T10:00:00.000Z'));
    expect(getPhq9Scores()).toEqual([
      { score: 14, at: '2026-09-01T10:00:00.000Z' },
      { score: 8, at: '2026-10-27T10:00:00.000Z', kind: 'final' },
    ]);
    expect(getBaselinePhq9()?.score).toBe(14);
    expect(getFinalPhq9()?.score).toBe(8);
  });
});
