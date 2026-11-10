import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { FieldsStep } from '@/features/sessions/content/types';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

export default function FieldsStepView({
  step,
  answer,
  onAnswer,
}: {
  step: FieldsStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Ask the questions</Text>
        <Text style={stepText.title}>{step.title}</Text>
        {step.hint && <Text style={stepText.body}>{step.hint}</Text>}
      </View>
      {step.fields.map((field, i) => (
        <View key={field.label} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={answer[i] ?? ''}
            onChangeText={(text) => {
              const next = step.fields.map((_, j) => answer[j] ?? '');
              next[i] = text;
              onAnswer(next);
            }}
            placeholder={field.placeholder}
            placeholderTextColor={colors.inkFaint}
            multiline
            accessibilityLabel={field.label}
            style={styles.input}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  field: { gap: 6 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  input: {
    minHeight: 60,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
});
