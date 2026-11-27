import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import {
  EPQR_ITEMS,
  EPQR_SCALES,
  WISHED_DEAD_INDEX,
  epqrMax,
  epqrScores,
} from '@/features/assessment';
import { useResearcher } from '@/features/researcher/useResearcher';
import { colors, fonts, radius, type } from '@/theme';

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** The four EPQ-R scale scores with what each means, then all 100 answers like the paper form. */
export default function EpqrAnswersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students } = useResearcher();
  const student = students.find((s) => s.id === id);
  const epqr = student?.epqr;

  if (!student || !epqr) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>
          {student
            ? 'This student hasn’t taken the EPQ-R yet.'
            : 'This student isn’t in your caseload.'}
        </Text>
      </Screen>
    );
  }

  const scores = epqrScores(epqr.answers);

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>EPQ-R</Text>
        <Text style={styles.meta}>
          {student.name} · {longDate(epqr.at)}
        </Text>
      </View>

      <View style={styles.scales}>
        {EPQR_SCALES.map((scale) => {
          const max = epqrMax(scale.id);
          const score = scores[scale.id];
          return (
            <View
              key={scale.id}
              style={styles.scale}
              accessible
              accessibilityLabel={`${scale.name}: ${score} of ${max}. ${scale.meaning}`}
            >
              <View style={styles.scaleTop}>
                <Text style={styles.scaleName}>{scale.name}</Text>
                <Text style={styles.scaleScore}>
                  {score} <Text style={styles.scaleMax}>/ {max}</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(score / max) * 100}%` }]} />
              </View>
              <Text style={styles.meaning}>{scale.meaning}</Text>
            </View>
          );
        })}
      </View>

      <Text style={[type.eyebrow, styles.section]}>All answers</Text>
      {EPQR_ITEMS.map((item, i) => {
        const yes = epqr.answers[i];
        const flagged = i === WISHED_DEAD_INDEX && yes;
        return (
          <View key={item} style={[styles.row, i > 0 && styles.divider, flagged && styles.flagged]}>
            <Text style={styles.number}>{i + 1}</Text>
            <Text style={styles.item}>{item}</Text>
            <Text style={[styles.answer, flagged && { color: colors.danger }]}>
              {yes ? 'Yes' : 'No'}
            </Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  scales: { gap: 18, marginTop: 20 },
  scale: { gap: 6 },
  scaleTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  scaleName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  scaleScore: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  scaleMax: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  meaning: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.inkMuted },
  section: { marginTop: 28, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  flagged: { marginHorizontal: -8, paddingHorizontal: 8, backgroundColor: colors.dangerSoft },
  number: { width: 28, fontFamily: fonts.bold, fontSize: 13, color: colors.inkFaint },
  item: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
  answer: {
    width: 34,
    textAlign: 'right',
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink,
  },
});
