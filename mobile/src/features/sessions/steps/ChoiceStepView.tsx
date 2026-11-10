import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FlipInEasyX } from 'react-native-reanimated';

import { CheckIcon, CloseIcon } from '@/components/icons';
import ScaleArt from '@/features/sessions/art/ScaleArt';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import type { ChoiceStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

export default function ChoiceStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ChoiceStep;
  answer: number | undefined;
  onAnswer: (index: number) => void;
}) {
  const answered = answer !== undefined;

  return (
    <View style={styles.wrap}>
      {step.picture && <SessionPhoto photo={step.picture} style={styles.picture} />}
      {!step.picture && step.art && (
        <ScaleArt name={step.art} level={step.art === 'moon' ? 0 : 1} />
      )}
      <Text style={stepText.eyebrow}>
        {step.options.join() === 'True,False' ? 'True or false?' : 'Quick check'}
      </Text>
      <Text style={stepText.title}>{step.question}</Text>

      <View style={styles.list}>
        {step.options.map((option, i) => {
          const chosen = answer === i;
          const correct = i === step.answer;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: chosen, disabled: answered }}
              disabled={answered}
              onPress={() => {
                if (correct) haptics.success();
                else haptics.tap();
                onAnswer(i);
              }}
              style={({ pressed }) => [
                styles.option,
                answered && correct && styles.right,
                chosen && !correct && styles.wrong,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.label}>{option}</Text>
              {answered && correct && <CheckIcon size={16} color={colors.primary} />}
              {chosen && !correct && <CloseIcon size={14} color={colors.danger} />}
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <Animated.View
          entering={FlipInEasyX.duration(420)}
          style={[styles.reveal, answer !== step.answer && styles.revealWrong]}
        >
          <Text style={[styles.verdict, answer !== step.answer && { color: colors.ink }]}>
            {answer === step.answer ? 'Correct' : 'Not quite'}
          </Text>
          <Text style={stepText.feedback}>{step.explanation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16, paddingTop: 12 },
  picture: { height: 180 },
  list: { gap: 10, marginTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  right: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  wrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  label: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  reveal: { gap: 6, padding: 16, borderRadius: radius.md, backgroundColor: colors.mint },
  revealWrong: { backgroundColor: colors.butter },
  verdict: { fontFamily: fonts.heavy, fontSize: 16, color: colors.mintInk },
});
