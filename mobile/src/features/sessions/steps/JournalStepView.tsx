import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LockIcon } from '@/components/icons';
import type { JournalStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
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
      {!focused && !step.starters && (
        <View style={styles.art}>
          <StepArt icon="pencil" tone="lavender" />
        </View>
      )}
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Reflect</Text>
        <Text style={stepText.title}>{step.prompt}</Text>
        <Text style={stepText.body}>{step.hint}</Text>
        <View style={styles.sharedRow}>
          <LockIcon size={12} color={colors.inkFaint} />
          <Text style={styles.shared}>Saved to your journal, which your researcher can read.</Text>
        </View>
      </View>
      {step.starters && (
        <View style={styles.chips}>
          <Text style={styles.chipsLabel}>Pick any to get started</Text>
          <View style={styles.chipRow}>
            {step.starters.map((starter) => {
              const used = text.includes(starter.text.trim());
              return (
                <Pressable
                  key={starter.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: used }}
                  accessibilityHint="Adds the start of a sentence to your entry"
                  disabled={used}
                  onPress={() => {
                    haptics.tick();
                    onChange(text.trim() ? `${text.trimEnd()} ${starter.text}` : starter.text);
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    used && styles.chipUsed,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.chipText, used && { color: colors.primary }]}>
                    {starter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
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
  sharedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shared: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  chips: { gap: 8 },
  chipsLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipUsed: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
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
