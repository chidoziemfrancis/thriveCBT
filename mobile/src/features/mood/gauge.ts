// Rotation is measured in degrees clockwise from the gauge's left end: 0 points left,
// 90 straight up, 180 right. Each mood owns an equal slice of that half circle.

export function sweepPerMood(moodCount: number) {
  return 180 / moodCount;
}

/** Turns a touch relative to the gauge's centre into a needle rotation, 0–180. */
export function touchToRotation(dx: number, dyUp: number): number {
  // Touches below the centre line pin the needle to whichever end they are nearest.
  if (dyUp <= 0) return dx < 0 ? 0 : 180;
  const angle = (Math.atan2(dyUp, dx) * 180) / Math.PI;
  return Math.min(Math.max(180 - angle, 0), 180);
}

export function rotationToMood(rotation: number, moodCount: number): number {
  return Math.min(Math.floor(rotation / sweepPerMood(moodCount)), moodCount - 1);
}

/** Where the needle rests for a mood: the middle of its slice. */
export function moodToRotation(mood: number, moodCount: number): number {
  return (mood + 0.5) * sweepPerMood(moodCount);
}

/** A point on the gauge's arc for a rotation, in screen coordinates. */
export function pointOnArc(cx: number, cy: number, radius: number, rotation: number) {
  const theta = ((180 - rotation) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(theta), y: cy - radius * Math.sin(theta) };
}
