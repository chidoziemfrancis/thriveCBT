import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { useStressLog } from '@/features/coping/store/copingStore';
import { colors, fonts, radius, type } from '@/theme';

function day(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Every stressful moment logged, newest first, with how strong it was and what helped. */
export default function StressLogScreen() {
  const entries = useStressLog();
  const levels = entries.flatMap((e) => (e.level === undefined ? [] : [e.level]));
  const average = levels.length
    ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length)
    : null;

  return (
    <Screen footer={<Button onPress={() => router.push('/stress-log/new')}>Log a moment</Button>}>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Stress log</Text>
        <Text style={styles.meta}>
          {average !== null
            ? `${entries.length} logged · average stress ${average}%`
            : 'Notice what stresses you, and what helps.'}
        </Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Glyph name="chart" size={26} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing logged yet</Text>
          <Text style={styles.emptyBody}>
            When something stresses you, log it here. Patterns show up after a week or two.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {entries.map((e, i) => (
            <Animated.View
              key={e.id}
              entering={FadeInDown.delay(Math.min(i, 6) * 40).duration(280)}
              style={[styles.row, i > 0 && styles.divider]}
            >
              <View style={styles.rowTop}>
                <Text style={styles.day}>{day(e.at)}</Text>
                {e.level !== undefined && <Text style={styles.level}>{e.level}%</Text>}
              </View>
              <Text style={styles.situation}>{e.situation}</Text>
              {e.helped ? <Text style={styles.helped}>Helped: {e.helped}</Text> : null}
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  list: { marginTop: 20 },
  row: { gap: 6, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  day: { flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  level: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.peachInk,
    backgroundColor: colors.peach,
  },
  situation: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  helped: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  empty: { alignItems: 'center', gap: 8, marginTop: 48, paddingHorizontal: 12 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  emptyBody: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
});
