// Long questionnaires (the EPQ-R has 100 items) would turn one-segment-per-question into
// hairlines, so the bar caps out and each segment then covers a run of questions.
export const MAX_SEGMENTS = 10;

/** Which segments are filled when `answered` of `total` questions are done. */
export function segmentFill(
  answered: number,
  total: number,
  maxSegments = MAX_SEGMENTS
): boolean[] {
  const count = Math.min(total, maxSegments);
  return Array.from({ length: count }, (_, i) => answered >= Math.ceil(((i + 1) * total) / count));
}
