import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import type { MythFactStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** The student calls it first, then sees the reason, so the idea sticks better than reading it. */
export default function MythFactStepView({
  step,
  answer,
  onAnswer,
}: {
  step: MythFactStep;
  answer: boolean | undefined;
  onAnswer: (saysFact: boolean) => void;
}) {
  const answered = answer !== undefined;
  const right = answered && answer === step.isFact;

  return (
    <View style={styles.wrap}>
      <Text style={[stepText.eyebrow, stepText.centered]}>Myth or fact?</Text>
      <View style={styles.statement}>
        <Text style={styles.statementText}>“{step.statement}”</Text>
      </View>

      <View style={styles.buttons}>
        {[
          { label: 'Myth', value: false },
          { label: 'Fact', value: true },
        ].map(({ label, value }) => {
          const chosen = answer === value;
          const correct = value === step.isFact;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: chosen, disabled: answered }}
              disabled={answered}
              onPress={() => {
                if (value === step.isFact) haptics.success();
                else haptics.tap();
                onAnswer(value);
              }}
              style={({ pressed }) => [
                styles.button,
                answered && correct && styles.right,
                chosen && !correct && styles.wrong,
                answered && !chosen && !correct && { opacity: 0.4 },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={[styles.buttonText, answered && correct && { color: colors.onPrimary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {answered && (
        <Animated.View entering={FadeInDown.duration(320)} style={styles.reveal}>
          <Animated.Text entering={ZoomIn.springify()} style={styles.verdict}>
            {right ? 'You got it!' : `It’s a ${step.isFact ? 'fact' : 'myth'}`}
          </Animated.Text>
          <Text style={stepText.feedback}>{step.explanation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 24 },
  statement: {
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.lavender,
    minHeight: 150,
    justifyContent: 'center',
  },
  statementText: {
    fontFamily: fonts.heavy,
    fontSize: 22,
    lineHeight: 30,
    color: colors.ink,
    textAlign: 'center',
  },
  buttons: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { backgroundColor: colors.primary, borderColor: colors.primary },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  buttonText: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  reveal: { gap: 8, padding: 16, borderRadius: radius.md, backgroundColor: colors.mint },
  verdict: { fontFamily: fonts.heavy, fontSize: 17, color: colors.mintInk },
});
