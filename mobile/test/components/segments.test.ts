import { describe, expect, it } from '@jest/globals';

import { MAX_SEGMENTS, segmentFill } from '@/components/questionnaire/segments';

describe('segmentFill', () => {
  it('uses one segment per question for short questionnaires', () => {
    expect(segmentFill(0, 9)).toEqual(Array(9).fill(false));
    expect(segmentFill(4, 9)).toEqual([true, true, true, true, false, false, false, false, false]);
    expect(segmentFill(9, 9)).toEqual(Array(9).fill(true));
  });

  it('caps long questionnaires so each segment covers a run of questions', () => {
    const empty = segmentFill(0, 100);
    expect(empty).toHaveLength(MAX_SEGMENTS);
    expect(segmentFill(9, 100).filter(Boolean)).toHaveLength(0);
    expect(segmentFill(10, 100).filter(Boolean)).toHaveLength(1);
    expect(segmentFill(55, 100).filter(Boolean)).toHaveLength(5);
    expect(segmentFill(100, 100)).toEqual(Array(MAX_SEGMENTS).fill(true));
  });

  it('only fills a segment once all of its questions are answered', () => {
    // 23 questions over 10 segments: the first segment covers questions 1–3.
    expect(segmentFill(2, 23)[0]).toBe(false);
    expect(segmentFill(3, 23)[0]).toBe(true);
  });
});
