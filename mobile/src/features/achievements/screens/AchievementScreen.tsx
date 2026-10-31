import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, CloseIcon } from '@/components/icons';
import { TIER_LABEL, TIER_NAMES, unitFor } from '@/features/achievements/achievements';
import { getSeenLevels, markAchievementSeen } from '@/features/achievements/achievementsSeen';
import Medallion, { METALS } from '@/features/achievements/components/Medallion';
import { useAchievements } from '@/features/achievements/useAchievements';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AchievementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { states } = useAchievements();
  const state = states.find((s) => s.def.id === id);
  const level = state?.level ?? 0;

  // Opening an achievement marks its tier as seen; a fresh unlock gets a little celebration.
  useEffect(() => {
    if (!state || level === 0) return;
    const wasNew = level > (getSeenLevels()[state.def.id] ?? 0);
    markAchievementSeen(state.def.id, level);
    if (wasNew) haptics.success();
  }, [state, level]);

  // A slow float keeps an earned medallion feeling alive without being distracting.
  const float = useSharedValue(0);
  useEffect(() => {
    if (level === 0) return;
    float.set(
      withRepeat(
        withSequence(withTiming(-5, { duration: 1600 }), withTiming(0, { duration: 1600 })),
        -1
      )
    );
  }, [float, level]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.get() }] }));

  if (!state) return null;
  const { def, tier, count, next, unlockedAt } = state;
  const metal = METALS[tier ?? 'locked'];
  const nextTier = next === null ? null : TIER_NAMES[level];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.close}
        >
          <CloseIcon size={16} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.hero}>
          <Animated.View style={floatStyle}>
            <Medallion def={def} tier={tier} size={168} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(360)} style={styles.head}>
          <Text style={[type.title, styles.center]}>{def.title}</Text>
          <View
            style={[styles.tierPill, { backgroundColor: tier ? metal.pill : colors.surfaceMuted }]}
          >
            <Text style={[styles.tierText, !tier && { color: colors.inkMuted }]}>
              {tier ? `${TIER_LABEL[tier]}${level > 1 ? ` · ×${level}` : ''}` : 'Locked'}
            </Text>
          </View>
          <Text style={[type.body, styles.center]}>{def.description}</Text>
          <Text style={styles.date}>
            {unlockedAt ? `Unlocked ${longDate(unlockedAt)}` : 'Not unlocked yet'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(360)} style={styles.card}>
          {next !== null && nextTier ? (
            <>
              <View style={styles.progressHead}>
                <Text style={styles.progressTitle}>
                  {level === 0 ? 'To unlock' : `Next: ${TIER_LABEL[nextTier]}`}
                </Text>
                <Text style={styles.progressCount}>
                  {count} / {next}
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.min(count / next, 1) * 100}%`,
                      backgroundColor: METALS[nextTier].pill,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {next - count} more {unitFor(def, next - count)} to go
              </Text>
            </>
          ) : (
            <View style={styles.maxed}>
              <CheckIcon size={16} color={colors.primary} />
              <Text style={styles.progressTitle}>
                {def.thresholds.length > 1 ? 'Top tier reached. Amazing work.' : 'Unlocked'}
              </Text>
            </View>
          )}
        </Animated.View>

        {def.thresholds.length > 1 && (
          <Animated.View entering={FadeInDown.delay(280).duration(360)} style={styles.card}>
            <Text style={styles.ladderTitle}>Tiers</Text>
            <View style={styles.ladder}>
              {def.thresholds.map((threshold, i) => {
                const reached = level > i;
                const name = TIER_NAMES[i];
                return (
                  <View
                    key={threshold}
                    style={styles.step}
                    accessible
                    accessibilityLabel={`${TIER_LABEL[name]}: ${threshold} ${unitFor(def, threshold)}, ${
                      reached ? 'reached' : 'not yet'
                    }`}
                  >
                    <View style={!reached && styles.unreached}>
                      <Medallion def={def} tier={reached ? name : null} size={52} />
                    </View>
                    <Text style={[styles.stepName, reached && { color: METALS[name].pill }]}>
                      {i === 0 ? 'Unlock' : `×${i + 1}`}
                    </Text>
                    <Text style={styles.stepNeed}>{threshold}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.ladderUnit}>Counted in {def.unit[1]}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  bar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 16 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: 18, paddingHorizontal: 24, paddingBottom: 32 },
  hero: { alignItems: 'center', paddingTop: 4, paddingBottom: 6 },
  head: { alignItems: 'center', gap: 10 },
  center: { textAlign: 'center' },
  tierPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  tierText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.onPrimary },
  date: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkFaint },
  card: { gap: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  progressTitle: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  progressCount: { fontFamily: fonts.heavy, fontSize: 15, color: colors.inkMuted },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  progressHint: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  maxed: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ladderTitle: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  ladder: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  step: { alignItems: 'center', gap: 4, flex: 1 },
  unreached: { opacity: 0.55 },
  stepName: { fontFamily: fonts.heavy, fontSize: 12, color: colors.inkFaint },
  stepNeed: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  ladderUnit: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
