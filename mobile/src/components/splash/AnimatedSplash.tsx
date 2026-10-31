import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import SproutMark from '@/components/mascot/SproutMark';
import { colors, fonts } from '@/theme';

// Must match `imageWidth` for expo-splash-screen in app.json, so the native splash and this
// first frame line up exactly and the handoff is invisible.
export const SPLASH_MARK_WIDTH = 120;

const HOLD_MS = 1500;
const EXIT_MS = 380;
const REDUCED_HOLD_MS = 900;

// True once the splash starts leaving, so screens underneath can hold their entrance
// animations until they are actually visible. Defaults to true outside the app shell.
const SplashRevealedContext = createContext(true);
export const SplashRevealedProvider = SplashRevealedContext.Provider;
export const useSplashRevealed = () => useContext(SplashRevealedContext);

export default function AnimatedSplash({
  onReveal,
  onFinish,
}: {
  onReveal: () => void;
  onFinish: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onReveal, reduceMotion ? REDUCED_HOLD_MS : HOLD_MS);
    return () => clearTimeout(timer);
  }, [onReveal, reduceMotion]);

  const markScale = useSharedValue(1);
  const markTilt = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordOffset = useSharedValue(14);
  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);

  useEffect(() => {
    const finish = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(onFinish);
    };

    if (reduceMotion) {
      wordOpacity.value = withTiming(1, { duration: 200 });
      wordOffset.value = 0;
      screenOpacity.value = withDelay(REDUCED_HOLD_MS, withTiming(0, { duration: 250 }, finish));
      return;
    }

    markScale.value = withSequence(
      withTiming(1.12, { duration: 260, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
    markTilt.value = withDelay(
      120,
      withSequence(
        withTiming(-8, { duration: 140 }),
        withTiming(6, { duration: 160 }),
        withSpring(0, { damping: 10 })
      )
    );
    wordOpacity.value = withDelay(300, withTiming(1, { duration: 420 }));
    wordOffset.value = withDelay(300, withSpring(0, { damping: 14 }));

    const exitEasing = { duration: EXIT_MS, easing: Easing.in(Easing.quad) };
    screenScale.value = withDelay(HOLD_MS, withTiming(1.08, exitEasing));
    screenOpacity.value = withDelay(HOLD_MS, withTiming(0, exitEasing, finish));
  }, [
    reduceMotion,
    onFinish,
    markScale,
    markTilt,
    wordOpacity,
    wordOffset,
    screenOpacity,
    screenScale,
  ]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markScale.value }, { rotate: `${markTilt.value}deg` }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordOffset.value }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.screen, screenStyle]}
      onLayout={() => SplashScreen.hideAsync()}
      accessibilityLabel="ThriveCBT"
      pointerEvents="none"
    >
      <Animated.View style={markStyle}>
        <SproutMark width={SPLASH_MARK_WIDTH} />
      </Animated.View>

      <View style={styles.wordmarkSlot}>
        <Animated.View style={wordStyle}>
          <Text style={styles.wordmark}>
            Thrive<Text style={{ color: colors.primarySoft }}>CBT</Text>
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Positioned off-centre so adding the wordmark never shifts the mark from where the
  // native splash drew it.
  wordmarkSlot: {
    position: 'absolute',
    top: '50%',
    marginTop: SPLASH_MARK_WIDTH / 2 + 12,
  },
  wordmark: {
    fontFamily: fonts.heavy,
    fontSize: 34,
    letterSpacing: -0.6,
    color: colors.onPrimary,
  },
});
