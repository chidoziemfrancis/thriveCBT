import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { PromptStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** One short question per screen, so a thought diary feels like a conversation, not a form. */
export default function PromptStepView({
  step,
  text,
  onChange,
}: {
  step: PromptStep;
  text: string;
  onChange: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Thought diary</Text>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.hint}</Text>
      </View>

      {step.starters && (
        <View style={styles.chips}>
          {step.starters.map((starter) => (
            <Pressable
              key={starter}
              accessibilityRole="button"
              onPress={() => {
                haptics.tick();
                onChange(text.trim() ? `${text.trimEnd()} ${starter}` : starter);
              }}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.chipText}>{starter.trim()}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <TextInput
        value={text}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={step.placeholder ?? 'Write a line or two…'}
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={600}
        textAlignVertical="top"
        accessibilityLabel={step.title}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  input: {
    minHeight: 130,
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
