import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import type { RatingItem } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const SCALE = [1, 2, 3, 4, 5];

export default function RatingsModule({
  intro,
  items,
  initial,
  onComplete,
}: {
  intro: string;
  items: RatingItem[];
  initial?: Record<string, number>;
  onComplete: (ratings: Record<string, number>) => void;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>(initial ?? {});
  const allRated = items.every((item) => ratings[item.id] !== undefined);

  return (
    <View style={styles.wrap}>
      <Text style={type.body}>{intro}</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.scale} accessibilityRole="radiogroup" accessibilityLabel={item.label}>
            {SCALE.map((value) => {
              const selected = ratings[item.id] === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={`${value}${value === 1 ? `, ${item.low}` : value === 5 ? `, ${item.high}` : ''}`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    haptics.tick();
                    setRatings((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}
                >
                  <Text style={[styles.optionText, selected && { color: colors.onPrimary }]}>
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.anchors}>
            <Text style={styles.anchor}>{item.low}</Text>
            <Text style={styles.anchor}>{item.high}</Text>
          </View>
        </View>
      ))}

      <Button disabled={!allRated} onPress={() => onComplete(ratings)}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  scale: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    height: 46,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: { borderColor: colors.primaryEdge, backgroundColor: colors.primary },
  optionText: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  anchors: { flexDirection: 'row', justifyContent: 'space-between' },
  anchor: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
});
