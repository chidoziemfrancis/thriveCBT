import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import AnswerPills from '@/components/questionnaire/AnswerPills';
import QuestionnaireLayout from '@/components/questionnaire/QuestionnaireLayout';
import { getAnswers, setAnswer } from '@/features/assessment/assessmentStore';
import { PHQ9_OPTIONS, PHQ9_QUESTIONS } from '@/features/assessment/phq9';
import { colors, fonts } from '@/theme';

export default function Phq9QuestionScreen() {
  const params = useLocalSearchParams<{ step: string }>();
  const step = Number(params.step);
  const index = step - 1;
  const [saved] = useState<number | null>(() => getAnswers()[index] ?? null);

  if (Number.isNaN(step) || index < 0 || index >= PHQ9_QUESTIONS.length) return null;

  function handleAnswer(value: number) {
    setAnswer(index, value);
    if (step === PHQ9_QUESTIONS.length) router.replace('/assessment/phq9/results');
    else router.push(`/assessment/phq9/${step + 1}`);
  }

  return (
    <QuestionnaireLayout
      heading="Over the last 2 weeks, how often have you been bothered by…"
      highlight="last 2 weeks"
      answered={index}
      total={PHQ9_QUESTIONS.length}
      onPrevious={() => router.back()}
      note={
        step === 1
          ? 'There are no right or wrong answers. Go with your first instinct.'
          : 'Your answers are private and only seen by the research team.'
      }
    >
      <Animated.View entering={FadeInRight.duration(260)} style={styles.question}>
        <Text style={styles.count}>
          Question {step} of {PHQ9_QUESTIONS.length}
        </Text>
        <Text style={styles.prompt}>{PHQ9_QUESTIONS[index]}</Text>
      </Animated.View>

      <AnswerPills options={PHQ9_OPTIONS} selected={saved} onAnswer={handleAnswer} />
    </QuestionnaireLayout>
  );
}

const styles = StyleSheet.create({
  question: { gap: 8 },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  prompt: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 31, color: colors.ink },
});
