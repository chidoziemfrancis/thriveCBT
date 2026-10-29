import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import Button from '@/components/Button';
import DaysGrid from '@/components/DaysGrid';
import FrequencySlider from '@/components/FrequencySlider';
import Screen from '@/components/Screen';
import StepHeader from '@/components/StepHeader';
import { getAnswers, setAnswer } from '@/lib/assessmentStore';
import { FREQUENCY_COLORS, illustratedDays } from '@/lib/frequency';
import { PHQ9_OPTIONS, PHQ9_QUESTIONS } from '@/lib/phq9';
import { colors, fonts, radius, type } from '@/theme';

const LABELS = PHQ9_OPTIONS.map((option) => option.label);

export default function Phq9QuestionScreen() {
  const params = useLocalSearchParams<{ step: string }>();
  const step = Number(params.step);
  const index = step - 1;

  // Starts empty rather than on "Not at all" so the slider never suggests an answer.
  const [selected, setSelected] = useState<number | null>(() => getAnswers()[index] ?? null);

  if (Number.isNaN(step) || index < 0 || index >= PHQ9_QUESTIONS.length) return null;

  const isLast = step === PHQ9_QUESTIONS.length;
  const color = selected !== null ? FREQUENCY_COLORS[selected] : colors.border;

  function handleNext() {
    if (selected === null) return;
    setAnswer(index, selected);
    if (isLast) router.replace('/assessment/phq9/results');
    else router.push(`/assessment/phq9/${step + 1}`);
  }

  return (
    <Screen
      footer={
        <Button disabled={selected === null} onPress={handleNext}>
          {isLast ? 'See my results' : 'Next'}
        </Button>
      }
    >
      <StepHeader step={step} totalSteps={PHQ9_QUESTIONS.length} label="Question" />

      <Animated.View entering={FadeIn.duration(250)} style={styles.body}>
        <View style={styles.copy}>
          <Text style={[type.eyebrow, styles.center]}>
            Over the last 2 weeks, how often have you been bothered by…
          </Text>
          <Text style={[type.title, styles.center]}>{PHQ9_QUESTIONS[index]}</Text>
        </View>

        <View style={styles.card}>
          <DaysGrid filledDays={illustratedDays(selected)} color={color} />
          <Animated.Text
            key={selected ?? 'empty'}
            entering={FadeInDown.duration(220)}
            style={[styles.answer, selected === null && styles.answerEmpty]}
            accessibilityLiveRegion="polite"
          >
            {selected !== null ? LABELS[selected] : 'Slide to answer'}
          </Animated.Text>
        </View>

        <FrequencySlider labels={LABELS} value={selected} onChange={setSelected} color={color} />

        {step === 1 && (
          <Text style={[type.caption, styles.center]}>
            There are no right or wrong answers. Go with your first instinct.
          </Text>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 28, gap: 24 },
  copy: { gap: 10 },
  center: { textAlign: 'center' },
  card: {
    gap: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  answer: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink, textAlign: 'center' },
  answerEmpty: { color: colors.inkFaint },
});
