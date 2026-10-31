import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { severityBand } from '@/features/assessment/phq9';
import type { Phq9Result } from '@/features/assessment/scoreHistory';
import { colors, fonts, radius } from '@/theme';

// From "Moderately severe" up, a gentle route to support sits right next to the score.
const SUPPORT_FROM_SCORE = 15;

function dateOf(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * Shows the PHQ-9 in plain words rather than as a number to chase. A rising score is framed
 * as something to talk through, never as failing.
 */
export default function Phq9Card({ scores }: { scores: Phq9Result[] }) {
  if (scores.length === 0) return null;
  const first = scores[0];
  const latest = scores[scores.length - 1];
  const repeated = scores.length > 1;

  const note = !repeated
    ? 'This is where you started. We’ll check in again near the end of the programme.'
    : latest.score < first.score
      ? 'Your answers point to things feeling a little lighter than when you started.'
      : 'Things can go up and down, and that’s okay. Your researcher can talk it through with you.';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How you’ve been feeling</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Started · {dateOf(first.at)}</Text>
          <Text style={styles.rowValue}>{severityBand(first.score)}</Text>
        </View>
        {repeated && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Latest · {dateOf(latest.at)}</Text>
            <Text style={styles.rowValue}>{severityBand(latest.score)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.note}>{note}</Text>

      {latest.score >= SUPPORT_FROM_SCORE && (
        <Pressable accessibilityRole="button" onPress={() => router.push('/support')} hitSlop={8}>
          <Text style={styles.link}>Talk to someone now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  rows: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  rowValue: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  note: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
