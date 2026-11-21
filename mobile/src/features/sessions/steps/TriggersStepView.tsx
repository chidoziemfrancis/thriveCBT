import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PlusIcon } from '@/components/icons';
import ScoreRow from '@/features/activities/components/ScoreRow';
import { TRIGGERS, readTriggers, writeTriggers } from '@/features/coping/coping';
import type { TriggersStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** Pick what stresses you, then rate each pick 0 to 10 right under the chips. */
export default function TriggersStepView({
  step,
  answer,
  onAnswer,
}: {
  step: TriggersStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const picked = readTriggers(answer);
  const own = picked.filter((t) => !TRIGGERS.includes(t.label)).map((t) => t.label);

  function toggle(label: string) {
    haptics.tick();
    onAnswer(
      writeTriggers(
        picked.some((t) => t.label === label)
          ? picked.filter((t) => t.label !== label)
          : [...picked, { label }]
      )
    );
  }

  function addOwn() {
    const label = draft.trim();
    if (!label) return;
    if (!picked.some((t) => t.label === label)) toggle(label);
    setDraft('');
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.chips}>
        {[...TRIGGERS, ...own].map((label) => {
          const on = picked.some((t) => t.label === label);
          return (
            <Pressable
              key={label}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(label)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addOwn}
          returnKeyType="done"
          placeholder="Something else"
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel="Add your own trigger"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add"
          disabled={!draft.trim()}
          onPress={addOwn}
          style={[styles.add, !draft.trim() && { opacity: 0.4 }]}
        >
          <PlusIcon size={18} color={colors.onPrimary} />
        </Pressable>
      </View>

      {picked.map((t, i) => (
        <Animated.View
          key={t.label}
          entering={FadeInDown.duration(250)}
          style={[styles.rate, i === 0 && styles.firstRate]}
        >
          <ScoreRow
            label={t.label}
            value={t.level}
            onChange={(level) =>
              onAnswer(
                writeTriggers(picked.map((p) => (p.label === t.label ? { ...p, level } : p)))
              )
            }
            color={colors.peachInk}
            low="A little"
            high="Overwhelming"
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16, paddingTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.peachInk, backgroundColor: colors.peach },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  chipTextOn: { fontFamily: fonts.bold },
  addRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  add: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rate: { paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  firstRate: { marginTop: 4 },
});
