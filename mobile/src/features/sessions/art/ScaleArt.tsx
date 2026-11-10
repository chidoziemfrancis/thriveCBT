import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

import Cloud from './Cloud';

export type ScaleArtName = 'cloud' | 'flame' | 'moon' | 'battery' | 'target';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const INK = colors.primary;

/** `level` runs from 0 to 1 and moves the drawing; what 1 means depends on the picture. */
function useLevel(level: number) {
  const t = useSharedValue(level);
  useEffect(() => {
    t.set(withSpring(level, { damping: 14, stiffness: 120 }));
  }, [level, t]);
  return t;
}

// Heavier, darker and lower as sadness rises.
function CloudArt({ level }: { level: number }) {
  const t = useLevel(level);
  const cloud = useAnimatedStyle(() => ({
    transform: [{ translateY: t.value * 26 }, { scale: 0.85 + t.value * 0.35 }],
  }));
  const rain = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.5, 1], [0, 1], 'clamp'),
  }));
  const light = useAnimatedStyle(() => ({ opacity: 1 - t.value }));
  const dark = useAnimatedStyle(() => ({ opacity: t.value }));
  return (
    <View style={styles.stage}>
      <Animated.View style={cloud}>
        <Animated.View style={light}>
          <Cloud size={150} color="#C9D3DD" />
        </Animated.View>
        <Animated.View style={[styles.layer, dark]}>
          <Cloud size={150} color="#7E8B99" />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.rain, rain]}>
        <Svg width={120} height={50} viewBox="0 0 120 50">
          <Path
            d="M20 5l-6 18M50 10l-6 18M80 5l-6 18M105 12l-6 18"
            stroke="#7E8B99"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

// A flame that grows and warms with motivation.
function FlameArt({ level }: { level: number }) {
  const t = useLevel(level);
  const flame = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - t.value) * 30 }, { scale: 0.45 + t.value * 0.75 }],
  }));
  return (
    <View style={styles.stage}>
      <Animated.View style={flame}>
        <Svg width={110} height={140} viewBox="0 0 110 140">
          <Path
            d="M55 6c10 26 44 40 44 80a44 44 0 0 1-88 0c0-22 12-30 18-46 6 14 14 18 18 18-4-20 0-36 8-52z"
            fill="#F2A65A"
            stroke={colors.ink}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <Path d="M55 70c6 12 20 18 20 34a20 20 0 0 1-40 0c0-14 12-20 20-34z" fill="#F7DE9A" />
        </Svg>
      </Animated.View>
      <View style={styles.log} />
    </View>
  );
}

// Restless and tilted at poor sleep, calm with stars when sleep is good.
function MoonArt({ level }: { level: number }) {
  const t = useLevel(level);
  const moon = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(t.value, [0, 1], [-30, 0])}deg` }],
  }));
  const stars = useAnimatedStyle(() => ({ opacity: t.value }));
  const sky = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], ['#3B4A5C', '#2E3E66']),
  }));
  return (
    <Animated.View style={[styles.stage, styles.night, sky]}>
      <Animated.View style={[styles.layer, styles.full, stars]}>
        <Svg width="100%" height="100%" viewBox="0 0 300 180">
          {[
            [40, 40],
            [250, 30],
            [220, 130],
            [70, 140],
            [150, 22],
          ].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="#F7DE9A" />
          ))}
        </Svg>
      </Animated.View>
      <Animated.View style={moon}>
        <Svg width={110} height={110} viewBox="0 0 110 110">
          <Path
            d="M72 10a46 46 0 1 0 28 72A38 38 0 0 1 72 10z"
            fill="#F7DE9A"
            stroke={colors.ink}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

// Fills up with energy.
function BatteryArt({ level }: { level: number }) {
  const t = useLevel(level);
  const fill = useAnimatedStyle(() => ({
    width: `${12 + t.value * 88}%`,
    backgroundColor: interpolateColor(t.value, [0, 0.5, 1], ['#E8836B', '#F2C94C', INK]),
  }));
  return (
    <View style={styles.stage}>
      <View style={styles.battery}>
        <Animated.View style={[styles.charge, fill]} />
        <View style={styles.nub} />
      </View>
    </View>
  );
}

// Blurry, scattered rings come into focus as concentration improves.
function TargetArt({ level }: { level: number }) {
  const t = useLevel(level);
  const outer = useAnimatedProps(() => ({ cx: 75 + (1 - t.value) * 14 }));
  const middle = useAnimatedProps(() => ({ cx: 75 - (1 - t.value) * 12 }));
  const inner = useAnimatedProps(() => ({ cy: 75 + (1 - t.value) * 12 }));
  return (
    <View style={styles.stage}>
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <AnimatedCircle
          animatedProps={outer}
          cy={75}
          r={62}
          fill="none"
          stroke={INK}
          strokeWidth={6}
          opacity={0.5}
        />
        <AnimatedCircle
          animatedProps={middle}
          cy={75}
          r={40}
          fill="none"
          stroke={INK}
          strokeWidth={6}
          opacity={0.75}
        />
        <AnimatedCircle animatedProps={inner} cx={75} r={16} fill={INK} />
      </Svg>
    </View>
  );
}

const ART: Record<ScaleArtName, (props: { level: number }) => React.JSX.Element> = {
  cloud: CloudArt,
  flame: FlameArt,
  moon: MoonArt,
  battery: BatteryArt,
  target: TargetArt,
};

export default function ScaleArt({ name, level }: { name: ScaleArtName; level: number }) {
  const Art = ART[name];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Art level={level} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 180,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  night: { backgroundColor: '#2E3E66' },
  layer: { position: 'absolute' },
  full: { top: 0, right: 0, bottom: 0, left: 0 },
  rain: { position: 'absolute', bottom: 18 },
  log: { width: 90, height: 12, marginTop: -6, borderRadius: 6, backgroundColor: '#A86B3C' },
  battery: {
    width: 170,
    height: 76,
    padding: 7,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  charge: { height: '100%', borderRadius: 9 },
  nub: {
    position: 'absolute',
    right: -14,
    top: 22,
    width: 8,
    height: 24,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
});
