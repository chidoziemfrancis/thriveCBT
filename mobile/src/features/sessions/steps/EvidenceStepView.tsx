import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CloseIcon, PlusIcon } from '@/components/icons';
import BalanceScale from '@/features/sessions/art/BalanceScale';
import type { EvidenceStep } from '@/features/sessions/content/types';
import { readEvidence, writeEvidence } from '@/features/sessions/sessionLogic';
import { useThoughtLog } from '@/features/thoughts/thoughtLogStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

type Side = 'for' | 'against';

function Column({
  title,
  items,
  suggestions,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  suggestions: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}) {
  const [draft, setDraft] = useState('');
  function add(text: string) {
    const clean = text.trim();
    if (!clean || items.includes(clean)) return;
    haptics.tick();
    onAdd(clean);
    setDraft('');
  }
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      {items.map((item, i) => (
        <Animated.View key={item} entering={FadeIn.duration(200)} style={styles.item}>
          <Text style={styles.itemText}>{item}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item}`}
            hitSlop={8}
            onPress={() => onRemove(i)}
          >
            <CloseIcon size={12} color={colors.inkFaint} />
          </Pressable>
        </Animated.View>
      ))}
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => add(draft)}
          placeholder="Add…"
          placeholderTextColor={colors.inkFaint}
          returnKeyType="done"
          accessibilityLabel={`Add evidence: ${title}`}
          style={styles.addInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add"
          onPress={() => add(draft)}
          hitSlop={6}
        >
          <PlusIcon size={16} color={colors.primary} />
        </Pressable>
      </View>
      {suggestions
        .filter((s) => !items.includes(s))
        .slice(0, 3)
        .map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            onPress={() => add(s)}
            style={styles.suggestion}
          >
            <Text style={styles.suggestionText}>+ {s}</Text>
          </Pressable>
        ))}
    </View>
  );
}

/** Pick or write a thought, then add evidence on each side and watch the scale tip. */
export default function EvidenceStepView({
  step,
  answer,
  onAnswer,
}: {
  step: EvidenceStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const log = useThoughtLog();
  const { thought, for: forItems, against } = readEvidence(answer);
  const recent = [...new Set(log.map((r) => r.thought).filter(Boolean))].slice(0, 3);

  function update(next: { thought?: string; for?: string[]; against?: string[] }) {
    onAnswer(writeEvidence(next.thought ?? thought, next.for ?? forItems, next.against ?? against));
  }

  function add(side: Side, text: string) {
    update(side === 'for' ? { for: [...forItems, text] } : { against: [...against, text] });
  }
  function remove(side: Side, index: number) {
    update(
      side === 'for'
        ? { for: forItems.filter((_, i) => i !== index) }
        : { against: against.filter((_, i) => i !== index) }
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.thoughtBlock}>
        <Text style={styles.columnTitle}>The thought</Text>
        <TextInput
          value={thought}
          onChangeText={(t) => update({ thought: t })}
          placeholder="e.g. “I’ll never be good enough”"
          placeholderTextColor={colors.inkFaint}
          multiline
          accessibilityLabel="The thought you want to check"
          style={styles.thoughtInput}
        />
        {recent.length > 0 && !thought && (
          <View style={styles.recent}>
            <Text style={styles.recentLabel}>From your thought log</Text>
            {recent.map((r) => (
              <Pressable
                key={r}
                accessibilityRole="button"
                onPress={() => update({ thought: r })}
                style={styles.suggestion}
              >
                <Text style={styles.suggestionText}>“{r}”</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {thought.length > 0 && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.weigh}>
          <BalanceScale
            left={forItems.length}
            right={against.length}
            leftLabel="For"
            rightLabel="Against"
          />
          <View style={styles.columns}>
            <Column
              title="Evidence for"
              items={forItems}
              suggestions={step.suggestionsFor ?? []}
              onAdd={(t) => add('for', t)}
              onRemove={(i) => remove('for', i)}
            />
            <Column
              title="Evidence against"
              items={against}
              suggestions={step.suggestionsAgainst ?? []}
              onAdd={(t) => add('against', t)}
              onRemove={(i) => remove('against', i)}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  thoughtBlock: { gap: 8 },
  thoughtInput: {
    minHeight: 64,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  recent: { gap: 6 },
  recentLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  weigh: { gap: 6 },
  columns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, gap: 8 },
  columnTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  itemText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.ink },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addInput: { flex: 1, minHeight: 40, fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  suggestion: { paddingVertical: 4 },
  suggestionText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.primary },
});
