import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CloseIcon, PlusIcon } from '@/components/icons';
import { dayKey, nextSevenDays } from '@/features/activities/utils/activities';
import WeekStrip from '@/features/activities/components/WeekStrip';
import type { GoalStep } from '@/features/sessions/content/types';
import { GOAL_AREAS, readGoal, writeGoal } from '@/features/wellbeing/utils/wellbeing';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const MAX_STEPS = 3;

/** Pick an area, write one goal, break it into small steps and choose a day to start. */
export default function GoalStepView({
  step,
  answer,
  onAnswer,
}: {
  step: GoalStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const goal = readGoal(answer);
  const [draft, setDraft] = useState('');
  const [today] = useState(() => new Date());

  function update(next: Partial<typeof goal>) {
    onAnswer(writeGoal({ ...goal, ...next }));
  }

  function addStep() {
    const text = draft.trim();
    if (!text || goal.steps.length >= MAX_STEPS) return;
    haptics.tap();
    update({ steps: [...goal.steps, text] });
    setDraft('');
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>1 · Which part of life?</Text>
        <View style={styles.chips}>
          {GOAL_AREAS.map((area) => {
            const on = goal.area === area;
            return (
              <Pressable
                key={area}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tick();
                  update({ area });
                }}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{area}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {goal.area ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.section}>
          <Text style={styles.label}>2 · Your goal for the next three months</Text>
          <TextInput
            value={goal.goal}
            onChangeText={(text) => update({ goal: text })}
            placeholder="e.g. Pass all my courses this semester"
            placeholderTextColor={colors.inkFaint}
            multiline
            accessibilityLabel="Your goal"
            style={styles.input}
          />
        </Animated.View>
      ) : null}

      {goal.goal.trim() ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.section}>
          <Text style={styles.label}>3 · Small steps towards it</Text>
          {goal.steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <Text style={styles.stepText}>{s}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${s}`}
                hitSlop={10}
                onPress={() => update({ steps: goal.steps.filter((x) => x !== s) })}
              >
                <CloseIcon size={14} color={colors.inkFaint} />
              </Pressable>
            </View>
          ))}
          {goal.steps.length < MAX_STEPS && (
            <View style={styles.addRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={addStep}
                returnKeyType="done"
                placeholder={goal.steps.length === 0 ? 'The first, smallest step' : 'Then what?'}
                placeholderTextColor={colors.inkFaint}
                accessibilityLabel="Add a step"
                style={[styles.input, styles.flex]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add step"
                disabled={!draft.trim()}
                onPress={addStep}
                style={[styles.add, !draft.trim() && { opacity: 0.4 }]}
              >
                <PlusIcon size={18} color={colors.onPrimary} />
              </Pressable>
            </View>
          )}
        </Animated.View>
      ) : null}

      {goal.steps.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.section}>
          <Text style={styles.label}>4 · When will you take the first step?</Text>
          <WeekStrip
            days={nextSevenDays(today)}
            selected={goal.date}
            marks={goal.date ? { [goal.date]: 'planned' } : {}}
            onSelect={(date) => update({ date })}
            today={today}
          />
          {goal.date === dayKey(today) && <Text style={styles.note}>Today. Even better.</Text>}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  section: { gap: 10 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  chipTextOn: { fontFamily: fonts.bold, color: colors.primary },
  input: {
    minHeight: 48,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  flex: { flex: 1 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  stepText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  addRow: { flexDirection: 'row', gap: 8 },
  add: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
});
