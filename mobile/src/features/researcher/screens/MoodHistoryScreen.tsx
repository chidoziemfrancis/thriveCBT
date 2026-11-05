import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import MoodTrend from '@/features/progress/components/MoodTrend';
import { moodWeeks } from '@/features/researcher/moodHistory';
import { useResearcher } from '@/features/researcher/useResearcher';
import { colors, fonts, type } from '@/theme';

const FACE = 20;

function range(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const from = start.toLocaleDateString(
    undefined,
    sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' }
  );
  const to = end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `${from}–${to}`;
}

/** A student's moods: the trend chart they see themselves, then every study week so far. */
export default function MoodHistoryScreen() {
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

  const first = student.name.split(' ')[0];
  const weeks = moodWeeks(student.moods, student.joinedAt, now);

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Mood history</Text>
        <Text style={styles.meta}>
          {student.name} · {student.moods.length} {student.moods.length === 1 ? 'mood' : 'moods'}{' '}
          logged
        </Text>
      </View>

      <View style={styles.chart}>
        <MoodTrend
          entries={student.moods}
          emptyText={`${first} hasn’t logged a mood yet.`}
          showLogLink={false}
        />
      </View>

      <Text style={styles.sectionTitle}>Week by week</Text>
      <View>
        {weeks.map((w, i) => {
          const label =
            w.mostOften === null ? 'No moods' : `Mostly ${MOODS[w.mostOften].label.toLowerCase()}`;
          return (
            <View
              key={w.week}
              style={[styles.week, i > 0 && styles.divider]}
              accessible
              accessibilityLabel={`Week ${w.week}, ${range(w.start, w.end)}: ${label}`}
            >
              <View style={styles.weekText}>
                <Text style={styles.weekName}>Week {w.week}</Text>
                <Text style={styles.weekRange}>{range(w.start, w.end)}</Text>
              </View>
              <View style={styles.faces} accessibilityElementsHidden>
                {w.days.map((day) =>
                  day.mood !== null ? (
                    <MoodFace key={day.date.getTime()} mood={day.mood} size={FACE} />
                  ) : (
                    <View
                      key={day.date.getTime()}
                      style={[styles.noMood, day.future && styles.future]}
                    />
                  )
                )}
              </View>
              <Text style={[styles.summary, w.mostOften === null && { color: colors.inkFaint }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  chart: { marginTop: 24 },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  week: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  weekText: { width: 76, gap: 2 },
  weekName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  weekRange: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  faces: { flex: 1, flexDirection: 'row', gap: 3 },
  noMood: {
    width: FACE,
    height: FACE,
    borderRadius: FACE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  future: {
    borderStyle: 'solid',
    borderColor: colors.surfaceMuted,
    backgroundColor: colors.surfaceMuted,
  },
  summary: {
    width: 84,
    textAlign: 'right',
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
});
