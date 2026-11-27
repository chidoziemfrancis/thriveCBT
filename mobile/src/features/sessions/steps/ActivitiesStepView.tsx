import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckIcon, CloseIcon, PlusIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import { ACTIVITIES, GROUPS } from '@/features/activities/utils/activities';
import type { ActivitiesStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

export default function ActivitiesStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ActivitiesStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const own = answer.filter((label) => !ACTIVITIES.some((a) => a.label === label));

  function toggle(label: string) {
    haptics.tick();
    onAnswer(answer.includes(label) ? answer.filter((l) => l !== label) : [...answer, label]);
  }

  function addOwn() {
    const label = draft.trim();
    if (!label) return;
    haptics.tap();
    if (!answer.includes(label)) onAnswer([...answer, label]);
    setDraft('');
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      {GROUPS.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text style={styles.groupTitle}>
            {group.label} <Text style={styles.groupHint}>· {group.hint}</Text>
          </Text>
          <View style={styles.tiles}>
            {ACTIVITIES.filter((a) => a.group === group.id).map((a) => {
              const on = answer.includes(a.label);
              return (
                <Pressable
                  key={a.label}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={a.label}
                  onPress={() => toggle(a.label)}
                  style={({ pressed }) => [
                    styles.tile,
                    on && styles.tileOn,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <FeatureIcon name={a.icon} size={36} tone={group.tone} />
                  <Text style={[styles.tileLabel, on && styles.labelOn]}>{a.label}</Text>
                  <View style={[styles.box, on && styles.boxOn]}>
                    {on && <CheckIcon size={11} color={colors.onPrimary} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Your own</Text>
        {own.length > 0 && (
          <View style={styles.chips}>
            {own.map((label) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label}`}
                onPress={() => toggle(label)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{label}</Text>
                <CloseIcon size={12} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addOwn}
            returnKeyType="done"
            placeholder="Something else that lifts you"
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel="Add your own activity"
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  group: { gap: 10 },
  groupTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  groupHint: { fontFamily: fonts.medium, color: colors.inkFaint },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tileLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 17, color: colors.ink },
  labelOn: { fontFamily: fonts.bold },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  addRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: 48,
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
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
