import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { BreatheStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

// A gentle 4-2-6 rhythm: the longer out-breath is what helps the body settle.
const PHASES = [
  { label: 'Breathe in', ms: 4000, scale: 1 },
  { label: 'Hold', ms: 2000, scale: 1 },
  { label: 'Breathe out', ms: 6000, scale: 0.55 },
] as const;

const CIRCLE = 220;

export default function BreatheStepView({
  step,
  done,
  onDone,
}: {
  step: BreatheStep;
  done: boolean;
  onDone: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useSharedValue(0.55);
  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function run(phaseIndex: number, cycleIndex: number) {
    if (cycleIndex >= step.cycles) {
      setRunning(false);
      haptics.success();
      onDone();
      return;
    }
    const current = PHASES[phaseIndex];
    setPhase(phaseIndex);
    setCycle(cycleIndex);
    haptics.tick();
    scale.set(withTiming(current.scale, { duration: current.ms }));
    timer.current = setTimeout(() => {
      const next = (phaseIndex + 1) % PHASES.length;
      run(next, next === 0 ? cycleIndex + 1 : cycleIndex);
    }, current.ms);
  }

  return (
    <View style={stepText.center}>
      <View style={stepText.block}>
        <Text style={[stepText.title, stepText.centered]}>{step.title}</Text>
        <Text style={[stepText.body, stepText.centered]}>{step.body}</Text>
      </View>

      <View style={styles.stage} accessibilityLiveRegion="polite">
        <Animated.View style={[styles.circle, circleStyle]} />
        <View style={styles.inner}>
          <Text style={styles.phase}>
            {done ? 'Well done' : running ? PHASES[phase].label : 'Ready?'}
          </Text>
          {running && (
            <Text style={styles.cycle}>
              {cycle + 1} of {step.cycles}
            </Text>
          )}
        </View>
      </View>

      {!running && !done && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setRunning(true);
            run(0, 0);
          }}
          style={({ pressed }) => [styles.start, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.startText}>Start breathing</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: CIRCLE, height: CIRCLE, alignItems: 'center', justifyContent: 'center' },
  circle: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inner: { alignItems: 'center', gap: 4 },
  phase: { fontFamily: fonts.heavy, fontSize: 20, color: colors.mintInk },
  cycle: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  start: {
    paddingHorizontal: 24,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  startText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
