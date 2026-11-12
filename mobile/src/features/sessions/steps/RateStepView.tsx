import { StyleSheet, Text, View } from 'react-native';

import PercentSlider from '@/features/sessions/components/PercentSlider';
import type { RateStep } from '@/features/sessions/content/types';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const START = 50;

/** How much the student believes or feels something, with the thought shown above the slider. */
export default function RateStepView({
  step,
  answer,
  quote,
  onAnswer,
}: {
  step: RateStep;
  answer: number | undefined;
  quote?: string;
  onAnswer: (value: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>
      {quote ? (
        <View style={styles.quote}>
          <Text style={styles.quoteText}>“{quote}”</Text>
        </View>
      ) : null}
      <PercentSlider
        value={answer ?? START}
        onChange={onAnswer}
        color={colors.primary}
        label={step.title}
        low={step.low}
        high={step.high}
      />
      {answer === undefined && <Text style={styles.hint}>Slide to answer.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  quote: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.lavender },
  quoteText: {
    fontFamily: fonts.heavy,
    fontSize: 18,
    lineHeight: 25,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
});
