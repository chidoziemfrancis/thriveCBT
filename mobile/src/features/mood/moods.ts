export type Mood = { label: string; color: string };

// Ordered low to high so a mood's index is also its score for tracking over time.
export const MOODS: Mood[] = [
  { label: 'Awful', color: '#E8836B' },
  { label: 'Low', color: '#F2A65A' },
  { label: 'Okay', color: '#F2C94C' },
  { label: 'Good', color: '#9BCB6B' },
  { label: 'Great', color: '#5DB47E' },
];
