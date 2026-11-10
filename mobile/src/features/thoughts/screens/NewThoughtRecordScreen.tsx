import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import { addJournalEntry } from '@/features/journal/journalStore';
import type { StepAnswer } from '@/features/sessions/content/types';
import { diaryText, isStepReady } from '@/features/sessions/sessionLogic';
import EmotionStepView from '@/features/sessions/steps/EmotionStepView';
import PromptStepView from '@/features/sessions/steps/PromptStepView';
import RecapStepView from '@/features/sessions/steps/RecapStepView';
import TrapsStepView from '@/features/sessions/steps/TrapsStepView';
import { RECORD_RECAP, RECORD_STEPS } from '@/features/thoughts/recordSteps';
import { recordFromDiary } from '@/features/thoughts/thoughtLog';
import { addThoughtRecord } from '@/features/thoughts/thoughtLogStore';
import { haptics } from '@/lib/haptics';
import { colors, radius } from '@/theme';

/** A thought record outside any session, for catching thoughts as they happen during the week. */
export default function NewThoughtRecordScreen() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>({});
  const step = RECORD_STEPS[index];
  const answer = answers[step.id];
  const last = index === RECORD_STEPS.length - 1;

  function set(value: StepAnswer) {
    setAnswers((a) => ({ ...a, [step.id]: value }));
  }

  function next() {
    if (!last) {
      haptics.tick();
      setIndex((i) => i + 1);
      return;
    }
    const record = recordFromDiary(RECORD_RECAP, answers);
    const text = diaryText(RECORD_RECAP, answers);
    if (record) addThoughtRecord(record);
    if (text) addJournalEntry({ prompt: 'Thought record', text });
    haptics.success();
    router.back();
  }

  function back() {
    if (index === 0) return router.back();
    haptics.tick();
    setIndex((i) => i - 1);
  }

  const list = Array.isArray(answer) ? (answer as string[]) : [];

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
          {RECORD_STEPS.map((s, i) => (
            <View key={s.id} style={[styles.dot, i <= index && styles.dotOn]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Animated.View key={step.id} entering={FadeIn.duration(250)}>
          {step.kind === 'prompt' && (
            <PromptStepView
              step={step}
              text={typeof answer === 'string' ? answer : ''}
              onChange={set}
            />
          )}
          {step.kind === 'emotion' && <EmotionStepView step={step} answer={list} onAnswer={set} />}
          {step.kind === 'traps' && <TrapsStepView step={step} answer={list} onAnswer={set} />}
          {step.kind === 'recap' && (
            <RecapStepView step={step} steps={RECORD_STEPS} answers={answers} />
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button disabled={!isStepReady(step, answer)} onPress={next}>
          {last ? 'Save to my thought log' : 'Continue'}
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
