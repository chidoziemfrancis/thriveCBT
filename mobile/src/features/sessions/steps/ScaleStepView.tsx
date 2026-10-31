import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScaleStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

import StepArt from './StepArt';
import { stepText } from './stepText';

const POINTS = [1, 2, 3, 4, 5];

export default function ScaleStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ScaleStep;
  answer: number | undefined;
  onAnswer: (value: number) => void;
}) {
  return (
    <View style={stepText.center}>
      <StepArt icon="chart" tone="lavender" />
      <View style={stepText.block}>
        <Text style={[stepText.eyebrow, stepText.centered]}>Over the past week</Text>
        <Text style={[stepText.title, stepText.centered]}>{step.title}</Text>
      </View>

      <View style={styles.scale}>
        <View style={styles.row} accessibilityRole="radiogroup">
          {POINTS.map((point) => {
            const on = answer === point;
            return (
              <Pressable
                key={point}
                accessibilityRole="radio"
                accessibilityLabel={`${point} of 5${point === 1 ? `, ${step.low}` : point === 5 ? `, ${step.high}` : ''}`}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tick();
                  onAnswer(point);
                }}
                style={({ pressed }) => [
                  styles.point,
                  on && styles.pointOn,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Text style={[styles.pointText, on && { color: colors.onPrimary }]}>{point}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.ends}>
          <Text style={styles.end}>{step.low}</Text>
          <Text style={styles.end}>{step.high}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { alignSelf: 'stretch', gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  point: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.08 }],
  },
  pointText: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
