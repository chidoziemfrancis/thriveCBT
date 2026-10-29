export const DAYS_IN_WINDOW = 14;

// An illustration of each PHQ-9 answer over the 2-week window. The stored answer is always
// the 0–3 option value; these counts only drive the dots on screen.
const ILLUSTRATED_DAYS = [0, 3, 8, 13];

// Calm teal through warm amber to coral, so higher frequency reads as heavier without alarm red.
export const FREQUENCY_COLORS = ['#12806F', '#C98A12', '#D9692E', '#C24E3A'];

export function illustratedDays(value: number | null): number {
  return value === null ? 0 : (ILLUSTRATED_DAYS[value] ?? 0);
}

export function stopForPosition(x: number, width: number, stops: number): number {
  if (width <= 0) return 0;
  const ratio = Math.min(Math.max(x / width, 0), 1);
  return Math.round(ratio * (stops - 1));
}
