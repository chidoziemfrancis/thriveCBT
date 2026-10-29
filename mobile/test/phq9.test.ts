import { describe, expect, it } from '@jest/globals';

import {
  PHQ9_OPTIONS,
  PHQ9_QUESTIONS,
  SUICIDAL_IDEATION_INDEX,
  severityBand,
} from '../src/lib/phq9';

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
