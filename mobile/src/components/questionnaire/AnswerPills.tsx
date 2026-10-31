import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

// Long enough to see the chosen pill light up before the next question slides in.
const ADVANCE_DELAY_MS = 260;

export type AnswerOption = { value: number; label: string };

/** Tap-to-answer pills; choosing one advances automatically, so there's no Next button. */
export default function AnswerPills({
  options,
  selected,
  onAnswer,
}: {
  options: AnswerOption[];
  selected: number | null;
  onAnswer: (value: number) => void;
}) {
  const [picked, setPicked] = useState<number | null>(selected);
  const locked = useRef(false);

  function choose(value: number) {
    if (locked.current) return;
    locked.current = true;
    haptics.tick();
    setPicked(value);
    setTimeout(() => {
      locked.current = false;
      onAnswer(value);
    }, ADVANCE_DELAY_MS);
  }

  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {options.map((option) => {
        const isPicked = picked === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isPicked }}
            onPress={() => choose(option.value)}
            style={({ pressed }) => [
              styles.pill,
              isPicked && styles.pillPicked,
              pressed && !isPicked && styles.pillPressed,
            ]}
          >
            <Text style={[styles.label, isPicked && styles.labelPicked]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  pill: {
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  pillPressed: { backgroundColor: '#C8EBDF' },
  pillPicked: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.bold, fontSize: 17, color: colors.mintInk },
  labelPicked: { color: colors.onPrimary },
});
