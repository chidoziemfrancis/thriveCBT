import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { DAYS_IN_WINDOW } from '@/lib/frequency';
import { colors } from '@/theme';

const STAGGER_MS = 25;

function Day({ index, filled, color }: { index: number; filled: boolean; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STAGGER_MS,
      withSpring(filled ? 1 : 0, { damping: 14, stiffness: 220 })
    );
  }, [filled, index, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.4 + progress.value * 0.6 }],
  }));

  return (
    <View style={styles.day}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

export default function DaysGrid({ filledDays, color }: { filledDays: number; color: string }) {
  return (
    <View
      style={styles.grid}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: DAYS_IN_WINDOW }, (_, i) => (
        <Day key={i} index={i} filled={i < filledDays} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  day: {
    width: '11%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { flex: 1, borderRadius: 999 },
});
