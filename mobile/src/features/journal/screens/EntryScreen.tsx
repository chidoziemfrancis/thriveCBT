import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { deleteJournalEntry, useJournal } from '@/features/journal/journalStore';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import { haptics } from '@/lib/haptics';
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

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Read live, so returning from an edit shows the new text straight away.
  const entry = useJournal().find((e) => e.id === id);

  if (!entry) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This entry has been deleted.</Text>
      </Screen>
    );
  }

  function confirmDelete() {
    Alert.alert('Delete this entry?', 'It will be gone for good. This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.tap();
          router.back();
          deleteJournalEntry(id);
        },
      },
    ]);
  }

  return (
    <Screen
      footer={
        <>
          <Button
            variant="secondary"
            onPress={() => router.push({ pathname: '/entry/write', params: { id } })}
          >
            Edit entry
          </Button>
          <Button variant="ghost" onPress={confirmDelete}>
            Delete
          </Button>
        </>
      }
    >
      <BackButton />

      <View style={styles.head}>
        <Text style={type.eyebrow}>
          {time(entry.at)}
          {entry.sessionId !== undefined ? ` · Session ${entry.sessionId}` : ''}
        </Text>
        <Text style={type.title}>{longDate(entry.at)}</Text>
        {entry.mood !== undefined && (
          <View style={styles.mood}>
            <MoodFace mood={entry.mood} size={26} />
            <Text style={styles.moodText}>Feeling {MOODS[entry.mood].label.toLowerCase()}</Text>
          </View>
        )}
      </View>

      {entry.prompt && (
        <View style={styles.promptBox}>
          <Text style={styles.eyebrow}>Prompt</Text>
          <Text style={styles.prompt}>{entry.prompt}</Text>
        </View>
      )}

      <Text style={styles.body} selectable>
        {entry.text}
      </Text>

      {entry.editedAt && (
        <Text style={styles.edited}>
          Edited{' '}
          {new Date(entry.editedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  head: { gap: 8, marginTop: 20 },
  mood: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  promptBox: {
    gap: 6,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.mint,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mintInk,
  },
  prompt: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 24, color: colors.ink },
  body: {
    marginTop: 20,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 27,
    color: colors.ink,
  },
  edited: { marginTop: 16, fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
