import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import type { SessionStep, StepAnswer } from '@/features/sessions/content/types';
import { isStepReady } from '@/features/sessions/sessionLogic';
import StepBody from '@/features/sessions/steps/StepBody';
import { haptics } from '@/lib/haptics';
import { colors, radius } from '@/theme';

/** A short run of session steps outside any session, saved in one go at the end. */
export default function StepFlow({
  steps,
  saveLabel,
  onSave,
}: {
  steps: SessionStep[];
  saveLabel: string;
  onSave: (answers: Record<string, StepAnswer>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>({});
  const step = steps[index];
  const answer = answers[step.id];
  const last = index === steps.length - 1;

  function set(value: StepAnswer) {
    setAnswers((a) => ({ ...a, [step.id]: value }));
  }

  function next() {
    if (!last) {
      haptics.tick();
      setIndex((i) => i + 1);
      return;
    }
    onSave(answers);
    haptics.success();
    router.back();
  }

  function back() {
    if (index === 0) return router.back();
    haptics.tick();
    setIndex((i) => i - 1);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={index === 0 ? 'Close' : 'Previous question'}
          onPress={back}
          hitSlop={10}
        >
          <ChevronLeftIcon color={colors.ink} />
        </Pressable>
        <View style={styles.dots}>
          {steps.map((s, i) => (
            <View key={s.id} style={[styles.dot, i <= index && styles.dotOn]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Animated.View key={step.id} entering={FadeIn.duration(250)}>
          <StepBody step={step} steps={steps} answers={answers} onAnswer={set} />
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button disabled={!isStepReady(step, answer)} onPress={next}>
          {last ? saveLabel : 'Continue'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dots: { flex: 1, flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  dotOn: { backgroundColor: colors.primary },
  body: { paddingHorizontal: 24, paddingBottom: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
});
