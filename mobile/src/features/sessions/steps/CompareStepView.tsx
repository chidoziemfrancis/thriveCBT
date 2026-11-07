import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';

import Cloud from '@/features/sessions/art/Cloud';
import type { CompareStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const KNOB = 30;
const DAYS = 14;

function dayLabel(day: number) {
  if (day >= DAYS) return '2 weeks and more';
  return day === 1 ? '1 day' : `${day} days`;
}

/** Dragging time forward shows the difference instead of telling it: one cloud clears, one stays. */
export default function CompareStepView({
  step,
  done,
  onDone,
}: {
  step: CompareStep;
  done: boolean;
  onDone: () => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [day, setDay] = useState(done ? DAYS : 1);
  const progress = useSharedValue(done ? 1 : 0);
  const start = useSharedValue(0);

  function update(next: number) {
    if (next !== day) {
      haptics.tick();
      setDay(next);
    }
    if (next >= DAYS && !done) {
      haptics.success();
      onDone();
    }
  }

  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      start.set(progress.get());
    },
    onUpdate: (event) => {
      'worklet';
      if (trackWidth === 0) return;
      const next = Math.min(1, Math.max(0, start.get() + event.translationX / trackWidth));
      progress.set(next);
      scheduleOnRN(update, Math.max(1, Math.round(1 + next * (DAYS - 1))));
    },
  });

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * Math.max(0, trackWidth - KNOB) }],
  }));
  const fill = useAnimatedStyle(() => ({
    width: KNOB + progress.value * Math.max(0, trackWidth - KNOB),
  }));
  const passingCloud = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35], [1, 0], 'clamp'),
    transform: [{ translateX: interpolate(progress.value, [0, 0.35], [0, 50], 'clamp') }],
  }));
  const sun = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.15, 0.4], [0, 1], 'clamp'),
  }));
  const stayingCloud = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.18]) }],
  }));
  const secondCloud = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.3, 0.8], [0, 1], 'clamp'),
  }));

  return (
    <View style={styles.wrap}>
      <Text style={stepText.title}>{step.title}</Text>

      <View style={styles.scenes} accessibilityElementsHidden>
        <View style={styles.scene}>
          <View style={styles.sky}>
            <Animated.View style={[styles.layer, sun]}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Circle cx={32} cy={32} r={20} fill="#F2C94C" />
              </Svg>
            </Animated.View>
            <Animated.View style={[styles.layer, passingCloud]}>
              <Cloud size={96} color="#B9C4D0" />
            </Animated.View>
          </View>
          <Text style={styles.sceneLabel}>{step.left}</Text>
        </View>
        <View style={styles.scene}>
          <View style={styles.sky}>
            <Animated.View style={[styles.layer, styles.backCloud, secondCloud]}>
              <Cloud size={70} color="#9AA6B4" />
            </Animated.View>
            <Animated.View style={[styles.layer, stayingCloud]}>
              <Cloud size={96} color="#8794A3" />
            </Animated.View>
          </View>
          <Text style={styles.sceneLabel}>{step.right}</Text>
        </View>
      </View>

      <View style={styles.sliderBlock}>
        <Text style={styles.day}>{dayLabel(day)}</Text>
        <GestureDetector gesture={pan}>
          <View
            style={styles.track}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="How long it lasts"
            accessibilityValue={{ text: dayLabel(day) }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => {
              const next = Math.min(
                DAYS,
                Math.max(1, day + (e.nativeEvent.actionName === 'increment' ? 4 : -4))
              );
              progress.set((next - 1) / (DAYS - 1));
              update(next);
            }}
          >
            <Animated.View style={[styles.fill, fill]} />
            <Animated.View style={[styles.knob, knob]} />
          </View>
        </GestureDetector>
        <View style={styles.ends}>
          <Text style={styles.end}>{step.start}</Text>
          <Text style={styles.end}>{step.end}</Text>
        </View>
      </View>

      {done ? (
        <Animated.Text entering={FadeInDown.duration(320)} style={stepText.feedback}>
          {step.lesson}
        </Animated.Text>
      ) : (
        <Text style={styles.hint}>Drag the circle to move time forward.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 12 },
  scenes: { flexDirection: 'row', gap: 12 },
  scene: { flex: 1, gap: 8, alignItems: 'center' },
  sky: {
    alignSelf: 'stretch',
    height: 150,
    borderRadius: radius.lg,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layer: { position: 'absolute' },
  backCloud: { top: 22, left: 14 },
  sceneLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  sliderBlock: { gap: 10 },
  day: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink, textAlign: 'center' },
  track: {
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.primarySoft,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.primary,
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  hint: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted, textAlign: 'center' },
});
