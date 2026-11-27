import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

const SIZES = { small: 18, medium: 28, large: 40 } as const;
const TURN_MS = 900;

export type SpinnerSize = keyof typeof SIZES;

/** A calm rounded arc that turns while something loads. */
export default function Spinner({
  size = 'medium',
  color = colors.primary,
  label = 'Loading',
}: {
  size?: SpinnerSize;
  color?: string;
  label?: string;
}) {
  const diameter = SIZES[size];
  const stroke = Math.max(2.5, diameter / 9);
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(
      withRepeat(withTiming(360, { duration: TURN_MS, easing: Easing.linear }), -1, false)
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const turning = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      <Animated.View style={[{ width: diameter, height: diameter }, turning]}>
        <Svg width={diameter} height={diameter}>
          <Circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={color}
            strokeOpacity={0.18}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.28} ${circumference}`}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
