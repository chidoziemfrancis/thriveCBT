import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import type { QuizQuestion } from '@/features/sessions/content/types';
import { quizScore } from '@/features/sessions/sessionLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const CORRECT = '#2F9E5B';
const CORRECT_SOFT = '#E3F5EA';

/** Answers are revealed with an explanation either way, so the quiz teaches rather than tests. */
export default function QuizModule({
  intro,
  questions,
  onComplete,
}: {
  intro: string;
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, number>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  if (finished) {
    const score = quizScore(questions, answers);
    return (
      <Animated.View entering={FadeIn} style={styles.result}>
        <FeatureIcon
          name={score === questions.length ? 'trophy' : 'bulb'}
          size={96}
          tone="butter"
        />
        <Text style={[type.title, styles.center]}>
          {score} of {questions.length} right
        </Text>
        <Text style={[type.body, styles.center]}>
          {score === questions.length
            ? 'Spot on. You’ve got the key ideas.'
            : 'Nice going. The explanations are the bit that matters, and you’ve seen them all.'}
        </Text>
        <View style={styles.resultButton}>
          <Button onPress={() => onComplete(answers)}>Continue</Button>
        </View>
      </Animated.View>
    );
  }

  const question = questions[index];
  const chosen = answers[question.id];
  const answered = chosen !== undefined;
  const isLast = index === questions.length - 1;

  function choose(option: number) {
    if (answered) return;
    if (option === question.answer) haptics.success();
    else haptics.error();
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  return (
    <Animated.View key={question.id} entering={FadeInDown.duration(260)} style={styles.wrap}>
      {index === 0 && <Text style={type.body}>{intro}</Text>}
      <Text style={type.eyebrow}>
        Question {index + 1} of {questions.length}
      </Text>
      <Text style={type.title}>{question.question}</Text>

      <View style={styles.options} accessibilityRole="radiogroup">
        {question.options.map((option, i) => {
          const isAnswer = i === question.answer;
          const isChosen = i === chosen;
          const showRight = answered && isAnswer;
          const showWrong = answered && isChosen && !isAnswer;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: isChosen, disabled: answered }}
              accessibilityLabel={`${option}${showRight ? ', correct answer' : showWrong ? ', not quite' : ''}`}
              disabled={answered}
              onPress={() => choose(i)}
              style={({ pressed }) => [
                styles.option,
                showRight && styles.optionRight,
                showWrong && styles.optionWrong,
                answered && !showRight && !showWrong && styles.optionFaded,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
              {showRight && (
                <View style={[styles.mark, { backgroundColor: CORRECT }]}>
                  <CheckIcon size={12} color={colors.onPrimary} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          style={[
            styles.explain,
            chosen === question.answer ? styles.explainRight : styles.explainWrong,
          ]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.explainTitle}>
            {chosen === question.answer ? 'That’s right!' : 'Not quite'}
          </Text>
          <Text style={styles.explainText}>{question.explanation}</Text>
        </Animated.View>
      )}

      {answered && (
        <Button onPress={isLast ? () => setFinished(true) : () => setIndex((i) => i + 1)}>
          {isLast ? 'See how I did' : 'Next question'}
        </Button>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  center: { textAlign: 'center' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionRight: { borderColor: CORRECT, backgroundColor: CORRECT_SOFT },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  optionFaded: { opacity: 0.5 },
  optionText: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explain: { gap: 4, padding: 16, borderRadius: radius.md },
  explainRight: { backgroundColor: CORRECT_SOFT },
  explainWrong: { backgroundColor: colors.surfaceMuted },
  explainTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  explainText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  resultButton: { alignSelf: 'stretch', marginTop: 12 },
});
