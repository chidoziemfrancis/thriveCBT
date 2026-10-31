import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '@/theme';

const RING = 76;
const STROKE = 8;

function message(good: number, logged: number) {
  if (logged === 0) return 'Log a mood on any day this week to see how it’s going.';
  if (good * 2 > logged) return 'You had more good days than low days this week.';
  if (good * 2 === logged) return 'An even mix of good days and harder ones this week.';
  // Never framed as failing: harder weeks are part of the programme.
  return 'It’s been a heavier week. That’s okay, and you don’t have to carry it alone.';
}

export default function ThisWeekCard({
  good,
  logged,
  percent,
}: {
  good: number;
  logged: number;
  percent: number;
}) {
  const r = (RING - STROKE) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`This week: ${percent}% good days. ${message(good, logged)}`}
    >
      <View style={styles.text}>
        <Text style={styles.title}>This week</Text>
        <Text style={styles.body}>{message(good, logged)}</Text>
        {logged > 0 && (
          <Text style={styles.meta}>
            {good} of {logged} logged {logged === 1 ? 'day' : 'days'} felt good or great
          </Text>
        )}
      </View>

      <View style={styles.ring}>
        <Svg width={RING} height={RING}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={r}
            stroke={colors.surfaceMuted}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={r}
            stroke={colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
            // Starts the arc at twelve o'clock instead of three.
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  text: { flex: 1, gap: 6 },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  meta: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  percent: { position: 'absolute', fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
});
