import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AchievementState, TIER_LABEL } from '@/features/achievements/achievements';
import { isNewUnlock } from '@/features/achievements/achievementsSeen';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import Medallion, { METALS } from './Medallion';

export default function AchievementsSection({
  states,
  seen,
}: {
  states: AchievementState[];
  seen: Record<string, number>;
}) {
  const unlocked = states.filter((s) => s.level > 0).length;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.count}>
          {unlocked} of {states.length} unlocked
        </Text>
      </View>

      <View style={styles.grid}>
        {states.map((state, i) => {
          const fresh = state.level > 0 && isNewUnlock(seen, state.def.id, state.level);
          const metal = METALS[state.tier ?? 'locked'];
          return (
            <Animated.View
              key={state.def.id}
              entering={ZoomIn.delay(50 * i)
                .springify()
                .damping(14)}
              style={styles.cell}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${state.def.title}, ${
                  state.tier ? TIER_LABEL[state.tier] : 'locked'
                }${fresh ? ', new' : ''}`}
                onPress={() => {
                  haptics.tap();
                  router.push({ pathname: '/achievement/[id]', params: { id: state.def.id } });
                }}
                style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 0.94 }] }]}
              >
                <Medallion def={state.def} tier={state.tier} size={76} />
                {fresh && (
                  <View style={styles.newTag}>
                    <Text style={styles.newText}>New</Text>
                  </View>
                )}
                <Text
                  style={[styles.name, state.level === 0 && { color: colors.inkMuted }]}
                  numberOfLines={1}
                >
                  {state.def.title}
                </Text>
                <Text style={[styles.tier, { color: state.tier ? metal.pill : colors.inkFaint }]}>
                  {state.tier ? TIER_LABEL[state.tier] : 'Locked'}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  cell: { width: '33.33%' },
  item: { alignItems: 'center', gap: 4 },
  newTag: {
    position: 'absolute',
    top: -4,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  newText: { fontFamily: fonts.heavy, fontSize: 10, color: colors.onPrimary },
  name: { marginTop: 4, fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  tier: { fontFamily: fonts.bold, fontSize: 11 },
});
