import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import { useResearcher } from '@/features/researcher/useResearcher';
import { colors, fonts, radius, type } from '@/theme';

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** One journal entry in full. Read-only: a researcher can never change a student's writing. */
export default function StudentJournalEntryScreen() {
  const { id, entry: entryId } = useLocalSearchParams<{ id: string; entry: string }>();
  const { students } = useResearcher();
  const student = students.find((s) => s.id === id);
  const entry = student?.journal.find((e) => e.id === entryId);

  if (!student || !entry) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This entry couldn’t be found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />

      <View style={styles.head}>
        <Text style={styles.eyebrow}>
          {student.name} · {time(entry.at)}
          {entry.sessionId !== undefined ? ` · Session ${entry.sessionId}` : ''}
        </Text>
        <Text style={type.title}>{longDate(entry.at)}</Text>
        {entry.mood !== undefined && (
          <View style={styles.mood}>
            <MoodFace mood={entry.mood} size={24} />
            <Text style={styles.moodText}>Feeling {MOODS[entry.mood].label.toLowerCase()}</Text>
          </View>
        )}
      </View>

      {entry.prompt && (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>Prompt</Text>
          <Text style={styles.prompt}>{entry.prompt}</Text>
        </View>
      )}

      <Text style={styles.body} selectable>
        {entry.text}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  head: { gap: 8, marginTop: 16 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  mood: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moodText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  promptBox: {
    gap: 6,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
  },
  promptLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mintInk,
  },
  prompt: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: {
    marginTop: 20,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 27,
    color: colors.ink,
  },
});
