import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CloseIcon, PlusIcon } from '@/components/icons';
import {
  HELPLINES,
  SAFETY_SECTIONS,
  copingCard,
  readContact,
  writeContact,
} from '@/features/coping/utils/coping';
import { useToolkit } from '@/features/coping/store/copingStore';
import type { SafetyStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** One part of the crisis plan: a short list, from suggestions or typed, with phone numbers for people. */
export default function SafetyStepView({
  step,
  answer,
  onAnswer,
}: {
  step: SafetyStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const toolkit = useToolkit();
  const [text, setText] = useState('');
  const [phone, setPhone] = useState('');
  const contacts = step.section === 'people' || step.section === 'pros';
  const index = SAFETY_SECTIONS.findIndex((s) => s.id === step.section);
  const fromToolkit =
    step.section === 'alone' ? toolkit.flatMap((id) => copingCard(id)?.title ?? []) : [];
  const suggestions = [...new Set([...fromToolkit, ...(step.suggestions ?? [])])].filter(
    (s) => !answer.includes(s)
  );

  function add(item: string) {
    if (!item || answer.includes(item)) return;
    haptics.tap();
    onAnswer([...answer, item]);
  }

  function addTyped() {
    add(contacts ? writeContact(text, phone) : text.trim());
    setText('');
    setPhone('');
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>
          Crisis plan · {index + 1} of {SAFETY_SECTIONS.length}
        </Text>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.hint}</Text>
      </View>

      {step.section === 'pros' && (
        <View style={styles.list}>
          {HELPLINES.map((h) => (
            <View key={h.name} style={styles.item}>
              <Text style={styles.itemText}>{h.name}</Text>
              <Text style={styles.fixed}>{h.phone ?? 'Number coming soon'}</Text>
            </View>
          ))}
        </View>
      )}

      {answer.length > 0 && (
        <View style={styles.list}>
          {answer.map((item) => {
            const c = readContact(item);
            return (
              <View key={item} style={styles.item}>
                <Text style={styles.itemText}>
                  {contacts ? c.name : item}
                  {contacts && c.phone ? <Text style={styles.fixed}> · {c.phone}</Text> : null}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${contacts ? c.name : item}`}
                  hitSlop={10}
                  onPress={() => {
                    haptics.tick();
                    onAnswer(answer.filter((a) => a !== item));
                  }}
                >
                  <CloseIcon size={14} color={colors.inkFaint} />
                </Pressable>
              </View>
            );
          })}
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

      <View style={styles.form}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={contacts ? undefined : addTyped}
          returnKeyType={contacts ? 'next' : 'done'}
          placeholder={contacts ? 'Name' : 'Write your own'}
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel={contacts ? 'Name' : 'Write your own'}
          style={styles.input}
        />
        {contacts && (
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone number (optional)"
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel="Phone number"
            style={styles.input}
          />
        )}
        <Pressable
          accessibilityRole="button"
          disabled={!text.trim()}
          onPress={addTyped}
          style={[styles.add, !text.trim() && { opacity: 0.4 }]}
        >
          <PlusIcon size={16} color={colors.onPrimary} />
          <Text style={styles.addText}>Add</Text>
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
  fixed: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
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
  form: { gap: 8 },
  input: {
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
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
});
