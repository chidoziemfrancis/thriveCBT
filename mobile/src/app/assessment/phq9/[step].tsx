import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import ChoiceButton from '@/components/ChoiceButton';
import Screen from '@/components/Screen';
import StepHeader from '@/components/StepHeader';
import { getAnswers, setAnswer } from '@/lib/assessmentStore';
import { PHQ9_OPTIONS, PHQ9_QUESTIONS } from '@/lib/phq9';
import { type } from '@/theme';

const ADVANCE_DELAY_MS = 280;

export default function Phq9QuestionScreen() {
  const params = useLocalSearchParams<{ step: string }>();
  const step = Number(params.step);
  const index = step - 1;

  const [selected, setSelected] = useState<number | null>(() => getAnswers()[index] ?? null);
  const advancing = useRef(false);

  if (Number.isNaN(step) || index < 0 || index >= PHQ9_QUESTIONS.length) return null;

  // Auto-advance after a beat so the selection registers visually first.
  function choose(value: number) {
    if (advancing.current) return;
    advancing.current = true;
    setSelected(value);
    setAnswer(index, value);

    setTimeout(() => {
      advancing.current = false;
      if (step < PHQ9_QUESTIONS.length) {
        router.push(`/assessment/phq9/${step + 1}`);
      } else {
        router.replace('/assessment/phq9/results');
      }
    }, ADVANCE_DELAY_MS);
  }

  return (
    <Screen>
      <StepHeader step={step} totalSteps={PHQ9_QUESTIONS.length} label="Question" />

      <Animated.View entering={FadeIn.duration(250)} style={styles.body}>
        <View style={styles.copy}>
          <Text style={type.eyebrow}>Over the last 2 weeks, how often have you been bothered by…</Text>
          <Text style={type.title}>{PHQ9_QUESTIONS[index]}</Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          {PHQ9_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={selected === option.value}
              onPress={() => choose(option.value)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </View>

        {step === 1 && (
          <Text style={[type.caption, styles.hint]}>
            There are no right or wrong answers. Go with your first instinct.
          </Text>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 28, gap: 28 },
  copy: { gap: 10 },
  options: { gap: 12 },
  hint: { textAlign: 'center' },
});
