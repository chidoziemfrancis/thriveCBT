import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { JournalStep } from '@/features/sessions/content/types';
import { colors, fonts, radius } from '@/theme';

import StepArt from './StepArt';
import { stepText } from './stepText';

const MAX_LENGTH = 2000;

export default function JournalStepView({
  step,
  text,
  onChange,
}: {
  step: JournalStep;
  text: string;
  onChange: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {!focused && (
        <View style={styles.art}>
          <StepArt icon="pencil" tone="lavender" />
        </View>
      )}
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Reflect</Text>
        <Text style={stepText.title}>{step.prompt}</Text>
        <Text style={stepText.body}>{step.hint}</Text>
      </View>
      <TextInput
        value={text}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Start writing…"
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        accessibilityLabel={step.prompt}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  art: { alignItems: 'center' },
  input: {
    minHeight: 180,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.primary },
});
