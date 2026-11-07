import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export type StoryScene = 'energy' | 'sleep' | 'withdraw' | 'loop';

const INK = colors.primary;
const SOFT = colors.primarySoft;

function useLoop(duration: number, delay = 0) {
  const reduce = useReducedMotion();
  const t = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    t.set(
      withDelay(
        delay,
        withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true)
      )
    );
  }, [delay, duration, reduce, t]);
  return t;
}

function Energy() {
  const t = useLoop(2200);
  const fill = useAnimatedStyle(() => ({ width: `${90 - t.value * 72}%` }));
  return (
    <View style={styles.battery}>
      <Animated.View style={[styles.charge, fill]} />
      <View style={styles.nub} />
    </View>
  );
}

function Sleep() {
  const t = useLoop(1800);
  const toss = useAnimatedStyle(() => ({ transform: [{ rotate: `${-12 + t.value * 24}deg` }] }));
  return (
    <Animated.View style={toss}>
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <Path
          d="M96 24a52 52 0 1 0 30 84A44 44 0 0 1 96 24z"
          fill={SOFT}
          stroke={INK}
          strokeWidth={4}
        />
        <Circle cx={112} cy={44} r={4} fill={INK} />
        <Circle cx={128} cy={70} r={3} fill={INK} />
      </Svg>
    </Animated.View>
  );
}

function Person({ x }: { x: number }) {
  return (
    <>
      <Circle cx={x} cy={58} r={14} fill={SOFT} stroke={INK} strokeWidth={3} />
      <Path
        d={`M${x - 20} 116c0-22 8-34 20-34s20 12 20 34`}
        fill={SOFT}
        stroke={INK}
        strokeWidth={3}
      />
    </>
  );
}

function Withdraw() {
  const t = useLoop(2400);
  const away = useAnimatedStyle(() => ({
    opacity: 1 - t.value * 0.55,
    transform: [{ translateX: t.value * 40 }],
  }));
  return (
    <View style={styles.row}>
      <Svg width={120} height={130} viewBox="0 0 120 130">
        <Person x={30} />
        <Person x={86} />
      </Svg>
      <Animated.View style={away}>
        <Svg width={60} height={130} viewBox="0 0 60 130">
          <Person x={30} />
        </Svg>
      </Animated.View>
    </View>
  );
}

function Loop() {
  const reduce = useReducedMotion();
  const spin = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    spin.set(withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1));
  }, [reduce, spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View style={style}>
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <Path
          d="M75 20a55 55 0 0 1 52 38M130 92a55 55 0 0 1-47 38M48 125a55 55 0 0 1-27-62"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M120 48l8 12 12-6M92 126l-10 6 2 12M18 74l4-12-12-4"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

const SCENES: Record<StoryScene, () => React.JSX.Element> = {
  energy: Energy,
  sleep: Sleep,
  withdraw: Withdraw,
  loop: Loop,
};

export default function StoryArt({ scene }: { scene: StoryScene }) {
  const Scene = SCENES[scene];
  return (
    <View style={styles.stage} accessibilityElementsHidden>
      <Scene />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { height: 200, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  battery: {
    width: 160,
    height: 70,
    padding: 6,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: INK,
    backgroundColor: colors.surface,
  },
  charge: { height: '100%', borderRadius: 8, backgroundColor: INK },
  nub: {
    position: 'absolute',
    right: -14,
    top: 20,
    width: 8,
    height: 22,
    borderRadius: 3,
    backgroundColor: INK,
  },
});
