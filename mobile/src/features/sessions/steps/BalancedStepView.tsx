import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { BalancedStep, StepAnswer } from '@/features/sessions/content/types';
import { balancedText, readEvidence } from '@/features/sessions/sessionLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** "Even though …, I also know …, so …", filled from the student's own evidence or typed. */
export default function BalancedStepView({
  step,
  answer,
  evidence,
  onAnswer,
}: {
  step: BalancedStep;
  answer: string[];
  evidence: StepAnswer | undefined;
  onAnswer: (value: string[]) => void;
}) {
  const { thought, for: forItems, against } = readEvidence(evidence);
  const chips = [forItems.length ? forItems : thought ? [thought] : [], against, []];
  const parts = [0, 1, 2].map((i) => answer[i] ?? '');
  const sentence = balancedText(step.frame, parts);

  function set(i: number, text: string) {
    const next = [...parts];
    next[i] = text;
    onAnswer(next);
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      {step.frame.map((lead, i) => (
        <View key={lead} style={styles.part}>
          <Text style={styles.lead}>{lead}…</Text>
          <TextInput
            value={parts[i]}
            onChangeText={(t) => set(i, t)}
            placeholder={i === 2 ? 'e.g. I can ask for help and try again' : 'Write or tap below'}
            placeholderTextColor={colors.inkFaint}
            multiline
            accessibilityLabel={lead}
            style={styles.input}
          />
          {chips[i].length > 0 && (
            <View style={styles.chips}>
              {chips[i].map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => {
                    haptics.tick();
                    set(i, c);
                  }}
                  style={[styles.chip, parts[i] === c && styles.chipOn]}
                >
                  <Text style={styles.chipText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}

      {sentence && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.result}>
          <Text style={styles.resultLabel}>Your balanced thought</Text>
          <Text style={styles.resultText}>{sentence}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  part: { gap: 8 },
  lead: { fontFamily: fonts.heavy, fontSize: 16, color: colors.primary },
  input: {
    minHeight: 52,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  result: { gap: 6, padding: 16, borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  resultLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  resultText: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 24, color: colors.ink },
});
