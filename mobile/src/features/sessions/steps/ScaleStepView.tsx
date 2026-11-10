import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import ScaleArt from '@/features/sessions/art/ScaleArt';
import type { ScaleStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

import StepArt from './StepArt';
import { stepText } from './stepText';

const POINTS = [1, 2, 3, 4, 5];
const DOT = 34;

/** Five stops on a track: tap one or slide along it, and the drawing above moves with you. */
export default function ScaleStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ScaleStep;
  answer: number | undefined;
  onAnswer: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);

  function choose(point: number) {
    if (point === answer) return;
    haptics.tick();
    onAnswer(point);
  }

  const pan = usePanGesture({
    onUpdate: (event) => {
      'worklet';
      if (width === 0) return;
      const share = Math.min(1, Math.max(0, event.x / width));
      scheduleOnRN(choose, 1 + Math.round(share * 4));
    },
  });

  const level = answer === undefined ? 0.5 : (answer - 1) / 4;

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Over the past week</Text>
        <Text style={stepText.title}>{step.title}</Text>
      </View>

      {step.art ? (
        <ScaleArt name={step.art} level={level} />
      ) : (
        <StepArt icon="chart" tone="lavender" />
      )}

      <View style={styles.scale}>
        <GestureDetector gesture={pan}>
          <View
            style={styles.track}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            accessibilityRole="radiogroup"
          >
            <View style={styles.line} />
            {answer !== undefined && (
              <View
                style={[styles.lineOn, { width: (Math.max(0, width - DOT) * (answer - 1)) / 4 }]}
              />
            )}
            {POINTS.map((point) => {
              const on = answer === point;
              const passed = answer !== undefined && point <= answer;
              return (
                <Pressable
                  key={point}
                  accessibilityRole="radio"
                  accessibilityLabel={`${point} of 5${point === 1 ? `, ${step.low}` : point === 5 ? `, ${step.high}` : ''}`}
                  accessibilityState={{ selected: on }}
                  hitSlop={8}
                  onPress={() => choose(point)}
                  style={[styles.dot, passed && styles.dotPassed, on && styles.dotOn]}
                />
              );
            })}
          </View>
        </GestureDetector>
        <View style={styles.ends}>
          <Text style={styles.end}>{step.low}</Text>
          <Text style={styles.end}>{step.high}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 24, paddingTop: 12 },
  scale: { gap: 12 },
  track: {
    height: DOT + 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    position: 'absolute',
    left: DOT / 2,
    right: DOT / 2,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
  },
  lineOn: {
    position: 'absolute',
    left: DOT / 2,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dotPassed: { borderColor: colors.primary },
  dotOn: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    transform: [{ scale: 1.3 }],
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
