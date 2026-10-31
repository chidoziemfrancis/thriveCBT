import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import Icon3D from '@/components/icons/Icon3D';
import type { Badge } from '@/features/progress/progressLogic';
import { colors, fonts, radius } from '@/theme';

export default function BadgeGrid({ items }: { items: Badge[] }) {
  const earned = items.filter((b) => b.earned).length;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.count}>
          {earned} of {items.length}
        </Text>
      </View>

      <View style={styles.grid}>
        {items.map((badge, i) => (
          <Animated.View
            key={badge.id}
            entering={ZoomIn.delay(60 * i).duration(280)}
            style={styles.badge}
            accessible
            accessibilityLabel={
              badge.earned ? `${badge.title}, earned` : `${badge.title}, locked. ${badge.hint}`
            }
          >
            <View style={[styles.medal, !badge.earned && styles.medalLocked]}>
              <Icon3D name={badge.image} size={36} />
            </View>
            <Text style={[styles.badgeTitle, !badge.earned && { color: colors.inkMuted }]}>
              {badge.title}
            </Text>
            {!badge.earned && <Text style={styles.hint}>{badge.hint}</Text>}
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  badge: { width: '33.33%', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  medal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Locked badges stay visible but faded, so students can see what's ahead.
  medalLocked: { backgroundColor: colors.surfaceMuted, opacity: 0.4 },
  badgeTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: 'center' },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
