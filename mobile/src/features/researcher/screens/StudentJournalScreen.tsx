import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { excerpt, groupByWeek } from '@/features/journal/journalLogic';
import MoodFace from '@/features/mood/components/MoodFace';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function entryDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** A student's journal, newest first and read-only, like a journaling app's timeline. */
export default function StudentJournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, now } = useResearcher();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This student isn’t in your caseload.</Text>
      </Screen>
    );
  }

  const groups = groupByWeek(student.journal, now);
  const first = student.name.split(' ')[0];

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Journal</Text>
        <Text style={styles.meta}>
          {student.name} · {student.journal.length}{' '}
          {student.journal.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      {groups.length === 0 ? (
        <Text style={styles.empty}>{first} hasn’t written in their journal yet.</Text>
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.entries.map((entry, i) => (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityLabel={`${entryDate(entry.at)}. ${entry.prompt ?? 'Free writing'}. ${excerpt(entry.text, 80)}`}
                onPress={() => {
                  haptics.tick();
                  router.push({
                    pathname: '/researcher/student/[id]/journal/[entry]',
                    params: { id: student.id, entry: entry.id },
                  });
                }}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && styles.divider,
                  pressed && { opacity: 0.6 },
                ]}
              >
                {entry.mood !== undefined ? (
                  <MoodFace mood={entry.mood} size={30} />
                ) : (
                  <View style={styles.noMood}>
                    <Glyph name="pencil" size={14} color={colors.inkFaint} />
                  </View>
                )}
                <View style={styles.text}>
                  <View style={styles.metaRow}>
                    <Text style={styles.date}>{entryDate(entry.at)}</Text>
                    {entry.sessionId !== undefined && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Session {entry.sessionId}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.prompt} numberOfLines={1}>
                    {entry.prompt ?? 'Free writing'}
                  </Text>
                  <Text style={styles.preview} numberOfLines={2}>
                    {excerpt(entry.text)}
                  </Text>
                </View>
                <ChevronRightIcon size={16} color={colors.inkFaint} />
              </Pressable>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  empty: { marginTop: 24, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  group: { marginTop: 24 },
  groupTitle: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  noMood: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.lavender,
  },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.lavenderInk },
  prompt: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  preview: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
});
