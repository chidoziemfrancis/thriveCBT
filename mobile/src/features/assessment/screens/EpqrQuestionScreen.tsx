import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import AnswerPills from '@/components/questionnaire/AnswerPills';
import QuestionnaireLayout from '@/components/questionnaire/QuestionnaireLayout';
import Button from '@/components/ui/Button';
import { EPQR_BREAKS, EPQR_ITEMS } from '@/features/assessment/epqr';
import { finishEpqr, getEpqrAnswers, setEpqrAnswer } from '@/features/assessment/epqrStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

const OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' },
];

const BREAK_WORDS: Record<number, string> = {
  25: 'A quarter done',
  50: 'Halfway there',
  75: 'Nearly there',
};

/**
 * All 100 questions on one screen, so the back stack doesn't grow by a hundred. Answers are
 * saved one by one, and there's a short breather after every 25.
 */
export default function EpqrQuestionScreen() {
  const [answers, setAnswers] = useState(getEpqrAnswers);
  const [index, setIndex] = useState(() => {
    const first = answers.findIndex((a) => a === undefined);
    return first === -1 ? Math.min(answers.length, EPQR_ITEMS.length - 1) : first;
  });
  const [resting, setResting] = useState(false);
  const total = EPQR_ITEMS.length;
  const saved = answers[index];

  function answer(value: number) {
    setEpqrAnswer(index, value === 1);
    const next = [...answers];
    next[index] = value === 1;
    setAnswers(next);
    if (index === total - 1) {
      finishEpqr();
      router.replace('/assessment/epqr/done');
      return;
    }
    setIndex(index + 1);
    if (EPQR_BREAKS.includes(index + 1)) {
      haptics.success();
      setResting(true);
    }
  }

  function previous() {
    if (resting) {
      setResting(false);
      setIndex(index - 1);
      return;
    }
    if (index === 0) return router.back();
    setIndex(index - 1);
  }

  return (
    <QuestionnaireLayout
      heading="How you usually are"
      highlight="usually"
      answered={index}
      total={total}
      onPrevious={previous}
      note={resting ? undefined : 'Go with your first answer. There are no right or wrong ones.'}
    >
      {resting ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.rest}>
          <Mascot size={96} mood="cheer" />
          <Text style={[type.title, styles.centerText]}>{BREAK_WORDS[index]}</Text>
          <Text style={[type.body, styles.centerText]}>
            {index} of {total} answered. Take a breath, then carry on when you’re ready.
          </Text>
          <View style={styles.restButton}>
            <Button onPress={() => setResting(false)}>Carry on</Button>
          </View>
        </Animated.View>
      ) : (
        <>
          <Animated.View key={index} entering={FadeInRight.duration(220)} style={styles.question}>
            <Text style={styles.count}>
              Question {index + 1} of {total}
            </Text>
            <Text style={styles.prompt}>{EPQR_ITEMS[index]}</Text>
          </Animated.View>
          <AnswerPills
            key={`pills-${index}`}
            options={OPTIONS}
            selected={saved === undefined ? null : saved ? 1 : 0}
            onAnswer={answer}
          />
        </>
      )}
    </QuestionnaireLayout>
  );
}

const styles = StyleSheet.create({
  question: { gap: 8 },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  prompt: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 31, color: colors.ink },
  rest: { alignItems: 'center', gap: 12, paddingTop: 12 },
  centerText: { textAlign: 'center' },
  restButton: { alignSelf: 'stretch', marginTop: 12 },
});
