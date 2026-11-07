import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/** A calm sun rising over a hill: a quiet "you did it", not confetti. */
export default function SunRise() {
  const reduce = useReducedMotion();
  const rise = useSharedValue(reduce ? 0 : 60);
  useEffect(() => {
    if (!reduce) rise.set(withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }));
  }, [reduce, rise]);
  const sun = useAnimatedStyle(() => ({ transform: [{ translateY: rise.value }] }));

  return (
    <View style={styles.stage} accessibilityElementsHidden>
      <Animated.View style={[styles.sun, sun]}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          {[0, 30, 60, 90, 120, 150, 180].map((a) => {
            const r = (a * Math.PI) / 180;
            const x1 = 90 - Math.cos(r) * 70;
            const y1 = 90 - Math.sin(r) * 70;
            const x2 = 90 - Math.cos(r) * 86;
            const y2 = 90 - Math.sin(r) * 86;
            return (
              <Path
                key={a}
                d={`M${x1} ${y1}L${x2} ${y2}`}
                stroke="#E8B54A"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
          <Circle cx={90} cy={90} r={54} fill="#F7DE9A" stroke={colors.ink} strokeWidth={4} />
        </Svg>
      </Animated.View>
      <Svg
        width="100%"
        height={70}
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        style={styles.hill}
      >
        <Path d="M0 40 Q200 0 400 40 V70 H0z" fill={colors.mint} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#FDF4DC',
  },
  sun: { position: 'absolute', top: 30 },
  hill: { position: 'absolute', bottom: 0 },
});
