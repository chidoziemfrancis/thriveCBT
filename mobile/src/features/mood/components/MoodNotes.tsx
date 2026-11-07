import { StyleSheet, Text, View } from 'react-native';

import MoodFace from '@/features/mood/components/MoodFace';
import { type MoodEntry, moodNotes } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { colors, fonts } from '@/theme';

function day(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** The most recent notes left with a mood, newest first. Renders nothing when there are none. */
export default function MoodNotes({ entries, title }: { entries: MoodEntry[]; title: string }) {
  const notes = moodNotes(entries);
  if (notes.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {notes.map((entry, i) => (
        <View
          key={entry.at}
          style={[styles.row, i > 0 && styles.divider]}
          accessible
          accessibilityLabel={`${day(entry.at)}, ${MOODS[entry.mood].label}: ${entry.note}`}
        >
          <MoodFace mood={entry.mood} size={26} />
          <View style={styles.text}>
            <Text style={styles.day}>{day(entry.at)}</Text>
            <Text style={styles.note}>{entry.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 2 },
  title: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  text: { flex: 1, gap: 2 },
  day: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  note: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.ink },
});
