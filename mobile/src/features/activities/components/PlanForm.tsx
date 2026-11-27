import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Button from '@/components/ui/Button';
  import { SLOTS, type Slot } from '@/features/activities/utils/activities';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import ScoreRow from './ScoreRow';

export type NewPlan = { label: string; slot: Slot; predicted?: number };

/** What to do, when in the day, and a guess at how much it'll be enjoyed. */
export default function PlanForm({
  suggestions,
  day,
  onAdd,
}: {
  suggestions: string[];
  /** e.g. "Wednesday", for the button. */
  day: string;
  onAdd: (plan: NewPlan) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [own, setOwn] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [predicted, setPredicted] = useState<number | undefined>();
  const label = (own.trim() || picked) ?? '';

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>What will you do?</Text>
      {suggestions.length > 0 && (
        <View style={styles.chips}>
          {suggestions.map((s) => {
            const on = picked === s && !own.trim();
            return (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptics.tick();
                  setOwn('');
                  setPicked(s);
                }}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <TextInput
        value={own}
        onChangeText={setOwn}
        placeholder={suggestions.length > 0 ? 'Or write your own' : 'e.g. Take a short walk'}
        placeholderTextColor={colors.inkFaint}
        accessibilityLabel="Your own activity"
        style={styles.input}
      />

      <Text style={styles.heading}>When?</Text>
      <View style={styles.slots}>
        {SLOTS.map((s) => {
          const on = slot === s.id;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tick();
                setSlot(s.id);
              }}
              style={[styles.slot, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScoreRow
        label="How much do you think you’ll enjoy it?"
        value={predicted}
        onChange={setPredicted}
        color={colors.butterInk}
        low="Not at all"
        high="A lot"
      />

      <Button
        disabled={!label || !slot}
        onPress={() => {
          if (!label || !slot) return;
          onAdd({ label, slot, predicted });
          setPicked(null);
          setOwn('');
          setSlot(null);
          setPredicted(undefined);
        }}
      >
        {`Add to ${day}`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heading: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  chipTextOn: { fontFamily: fonts.bold, color: colors.primary },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  slots: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
