import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { emotionLabel } from '@/features/sessions/emotions';
import { trapLabels } from '@/features/sessions/traps';
import { trapCounts } from '@/features/thoughts/thoughtLog';
import { useThoughtLog } from '@/features/thoughts/thoughtLogStore';
import { colors, fonts, radius, type } from '@/theme';

function day(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Every thought the student has caught, newest first, with the traps they spotted. */
export default function ThoughtLogScreen() {
  const records = useThoughtLog();
  const counts = trapCounts(records);

  return (
    <Screen
      footer={
        <>
          <Button onPress={() => router.push('/thought-log/new')}>New thought record</Button>
          <Button variant="secondary" onPress={() => router.push('/thought-log/challenge')}>
            Challenge a thought
          </Button>
        </>
      }
    >
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Thought log</Text>
        <Text style={styles.meta}>
          {counts.length > 0
            ? `This week: ${counts.map((c) => `${c.label} ×${c.count}`).join(' · ')}`
            : 'Catch a thought, name the feeling, spot the trap.'}
        </Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Glyph name="bulb" size={26} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No thoughts logged yet</Text>
          <Text style={styles.emptyBody}>
            When something upsets you, write down the thought that popped up. Over time you’ll see
            which traps you fall into most.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {records.map((r, i) => {
            const feeling = emotionLabel(r.feeling);
            const traps = trapLabels(r.traps);
            return (
              <Animated.View
                key={r.id}
                entering={FadeInDown.delay(Math.min(i, 6) * 40).duration(280)}
                style={[styles.row, i > 0 && styles.divider]}
                accessible
                accessibilityLabel={[day(r.at), r.thought, feeling, traps.join(', ')]
                  .filter(Boolean)
                  .join('. ')}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.day}>{day(r.at)}</Text>
                  {traps.map((t) => (
                    <Text key={t} style={styles.tag}>
                      {t}
                    </Text>
                  ))}
                </View>
                <Text style={styles.thought}>“{r.thought || r.situation}”</Text>
                {feeling && <Text style={styles.feeling}>{feeling}</Text>}
                {r.balanced && (
                  <View style={styles.balanced}>
                    <Text style={styles.balancedLabel}>
                      Balanced thought
                      {r.beliefBefore !== undefined && r.beliefAfter !== undefined
                        ? ` · belief ${r.beliefBefore}% → ${r.beliefAfter}%`
                        : ''}
                    </Text>
                    <Text style={styles.balancedText}>{r.balanced}</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
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
  rowTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  day: { flexGrow: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  tag: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  thought: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  feeling: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  balanced: {
    gap: 2,
    marginTop: 4,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  balancedLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  balancedText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
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
