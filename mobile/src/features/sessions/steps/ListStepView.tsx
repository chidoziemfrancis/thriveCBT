import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CloseIcon, PlusIcon } from '@/components/icons';
import { copingCard, readContact, readTriggers, spotLabels } from '@/features/coping/coping';
import { useCrisisPlan, useToolkit } from '@/features/coping/copingStore';
import type { ListStep } from '@/features/sessions/content/types';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { WELL_SECTIONS } from '@/features/wellbeing/wellbeing';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

/** Chips for each list, gathered from what the student already wrote in earlier sessions. */
function useEarlier(section: ListStep['section'], skills: string[]) {
  const s6 = useSessionProgress()[6]?.answers ?? {};
  const crisis = useCrisisPlan();
  const toolkit = useToolkit();
  switch (section) {
    case 'triggers':
      return readTriggers(s6['my-triggers']).map((t) => t.label);
    case 'signs':
      return [...spotLabels(list(s6['body-map'])), ...(crisis?.warning ?? [])];
    case 'actions':
      return [...skills, ...toolkit.flatMap((id) => copingCard(id)?.title ?? [])];
    case 'people':
      return (crisis?.people ?? []).map((p) => readContact(p).name);
  }
}

/** One list of the staying-well plan. */
export default function ListStepView({
  step,
  answer,
  skills,
  onAnswer,
}: {
  step: ListStep;
  answer: string[];
  skills: string[];
  onAnswer: (value: string[]) => void;
}) {
  const earlier = useEarlier(step.section, skills);
  const [text, setText] = useState('');
  const index = WELL_SECTIONS.findIndex((s) => s.id === step.section);
  const suggestions = [...new Set([...earlier, ...(step.suggestions ?? [])])].filter(
    (s) => s && s !== 'Not sure yet' && !answer.includes(s)
  );

  function add(item: string) {
    const clean = item.trim();
    if (!clean || answer.includes(clean)) return;
    haptics.tap();
    onAnswer([...answer, clean]);
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>
          Staying-well plan · {index + 1} of {WELL_SECTIONS.length}
        </Text>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.hint}</Text>
      </View>

      {answer.length > 0 && (
        <View style={styles.list}>
          {answer.map((item) => (
            <View key={item} style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item}`}
                hitSlop={10}
                onPress={() => {
                  haptics.tick();
                  onAnswer(answer.filter((a) => a !== item));
                }}
              >
                <CloseIcon size={14} color={colors.inkFaint} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.chips}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`Add ${s}`}
              onPress={() => add(s)}
              style={styles.chip}
            >
              <PlusIcon size={12} color={colors.primary} />
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => {
            add(text);
            setText('');
          }}
          returnKeyType="done"
          placeholder="Write your own"
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel="Write your own"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add"
          disabled={!text.trim()}
          onPress={() => {
            add(text);
            setText('');
          }}
          style={[styles.add, !text.trim() && { opacity: 0.4 }]}
        >
          <PlusIcon size={18} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
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
