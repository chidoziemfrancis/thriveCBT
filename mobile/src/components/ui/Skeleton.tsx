import { useEffect } from 'react';
import { type DimensionValue, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii } from '@/theme';

const PULSE_MS = 900;

/** Gentle pulse while content loads; still when the phone asks for less motion. */
function usePulse() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(
      withRepeat(
        withTiming(0.45, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}

/** A placeholder block in the shape of the content that's on its way. */
export default function Skeleton({
  width = '100%',
  height = 16,
  radius = radii.sm,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const pulse = usePulse();
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius }, pulse, style]}
    />
  );
}

/** Lines of placeholder text; the last line is shorter, like a real paragraph. */
export function SkeletonText({
  lines = 3,
  lineHeight = 14,
  gap = 10,
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
}) {
  return (
    <View style={{ gap }} accessibilityLabel="Loading" accessible>
      {lineWidths(lines).map((width, i) => (
        <Skeleton key={i} width={width} height={lineHeight} radius={lineHeight / 2} />
      ))}
    </View>
  );
}

export function lineWidths(lines: number): DimensionValue[] {
  return Array.from({ length: lines }, (_, i) => (i === lines - 1 && lines > 1 ? '60%' : '100%'));
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} radius={size / 2} />;
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceMuted },
});
