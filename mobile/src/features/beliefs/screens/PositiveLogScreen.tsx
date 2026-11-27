import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CloseIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { POSITIVE_KINDS, type PositiveKind, positiveKind } from '@/features/beliefs/beliefs';
import { addPositive, removePositive, usePositiveLog } from '@/features/beliefs/positiveLogStore';
import { useSessionProgress } from '@/features/sessions/store/progressStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function day(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Strengths, wins and kind words, collected one a day as evidence for the new belief. */
export default function PositiveLogScreen() {
  const entries = usePositiveLog();
  const belief = useSessionProgress()[7]?.answers?.['new-belief'];
  const [kind, setKind] = useState<PositiveKind>('win');
  const [text, setText] = useState('');

  function add() {
    if (!text.trim()) return;
    addPositive([{ kind, text }]);
    haptics.success();
    setText('');
  }

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Evidence for my new belief</Text>
        {typeof belief === 'string' && belief.trim() ? (
          <View style={styles.belief}>
            <Text style={styles.beliefText}>“{belief.trim()}”</Text>
          </View>
        ) : (
          <Text style={styles.meta}>
            Small proof, collected every day, that you’re more than your worst thoughts.
          </Text>
        )}
      </View>

      <View style={styles.count} accessibilityLabel={`${entries.length} pieces of evidence`}>
        <Animated.Text key={entries.length} entering={ZoomIn.springify()} style={styles.number}>
          {entries.length}
        </Animated.Text>
        <Text style={styles.countLabel}>
          {entries.length === 1 ? 'piece of evidence' : 'pieces of evidence'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Add today’s</Text>
        <View style={styles.kinds}>
          {POSITIVE_KINDS.map((k) => {
            const on = kind === k.id;
            return (
              <Pressable
                key={k.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tick();
                  setKind(k.id);
                }}
                style={[styles.kind, on && styles.kindOn]}
              >
                <Text style={[styles.kindText, on && styles.kindTextOn]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. I explained a topic to a coursemate"
          placeholderTextColor={colors.inkFaint}
          multiline
          accessibilityLabel="Your evidence"
          style={styles.input}
        />
        <Button disabled={!text.trim()} onPress={add}>
          Add to my evidence
        </Button>
      </View>

      <View style={styles.list}>
        {entries.map((e, i) => {
          const k = positiveKind(e.kind);
          return (
            <Animated.View
              key={e.id}
              entering={FadeInDown.delay(Math.min(i, 6) * 40).duration(280)}
              style={[styles.row, i > 0 && styles.divider]}
            >
              <FeatureIcon name={k.icon} size={36} tone={k.tone} />
              <View style={styles.rowText}>
                <Text style={styles.rowMeta}>
                  {k.label} · {day(e.at)}
                </Text>
                <Text style={styles.rowBody}>{e.text}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${e.text}`}
                hitSlop={10}
                onPress={() => {
                  haptics.tick();
                  removePositive(e.id);
                }}
              >
                <CloseIcon size={14} color={colors.inkFaint} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 10, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  belief: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.butter },
  beliefText: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 24, color: colors.ink },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 20 },
  number: { fontFamily: fonts.heavy, fontSize: 40, color: colors.primary },
  countLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkMuted },
  form: { gap: 12, marginTop: 16 },
  formTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kind: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kindOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  kindText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  kindTextOn: { fontFamily: fonts.bold, color: colors.primary },
  input: {
    minHeight: 64,
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
  list: { marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  rowText: { flex: 1, gap: 2 },
  rowMeta: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
  rowBody: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
});
