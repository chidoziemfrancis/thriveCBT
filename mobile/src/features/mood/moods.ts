import type { EmojiName } from '@/components/icons/emojiSources';

export type Mood = { label: string; emoji: EmojiName; color: string };

// Ordered low to high so a mood's index is also its score for tracking over time.
export const MOODS: Mood[] = [
  { label: 'Awful', emoji: 'faceDisappointed', color: '#E8836B' },
  { label: 'Low', emoji: 'faceConfused', color: '#F2A65A' },
  { label: 'Okay', emoji: 'faceNeutral', color: '#F2C94C' },
  { label: 'Good', emoji: 'faceSlightlySmiling', color: '#9BCB6B' },
  { label: 'Great', emoji: 'faceGrinning', color: '#5DB47E' },
];
