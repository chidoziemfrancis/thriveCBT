import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PIN_LENGTH } from '@/features/auth/pin';
import { colors, radius } from '@/theme';

const BOX = 64;

/** The four PIN boxes. Bump `shakeKey` to shake them, the universal "that's not right". */
export default function PinBoxes({
  length,
  shakeKey,
  error,
}: {
  length: number;
  shakeKey: number;
  error: boolean;
}) {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (shakeKey === 0) return;
    offset.set(
      withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    );
  }, [shakeKey, offset]);

  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <Animated.View
      style={[styles.row, shake]}
      accessibilityLabel={`${length} of ${PIN_LENGTH} digits entered`}
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: PIN_LENGTH }, (_, i) => {
        const filled = i < length;
        const active = i === length;
        return (
          <View
            key={i}
            style={[
              styles.box,
              active && styles.boxActive,
              filled && styles.boxFilled,
              error && styles.boxError,
            ]}
          >
            {filled && <Animated.View entering={ZoomIn.duration(140)} style={styles.dot} />}
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  box: {
    width: BOX,
    height: BOX,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.primary, backgroundColor: colors.surface },
  boxFilled: { backgroundColor: colors.surface, borderColor: colors.inkFaint },
  boxError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.ink },
});
