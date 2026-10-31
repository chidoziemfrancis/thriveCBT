import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FlipInEasyX } from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import type { RevealStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** Tap each card to turn it over; Continue unlocks once every card has been seen. */
export default function RevealStepView({
  step,
  revealed,
  onReveal,
}: {
  step: RevealStep;
  revealed: string[];
  onReveal: (ids: string[]) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.grid}>
        {step.cards.map((card) => {
          const open = revealed.includes(card.id);
          return (
            <Pressable
              key={card.id}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              accessibilityLabel={
                open ? `${card.label}: ${card.detail}` : `${card.label}, tap to reveal`
              }
              onPress={() => {
                if (open) return;
                haptics.tap();
                onReveal([...revealed, card.id]);
              }}
              style={({ pressed }) => [styles.cell, pressed && { transform: [{ scale: 0.96 }] }]}
            >
              {open ? (
                <Animated.View
                  entering={FlipInEasyX.duration(380)}
                  style={[styles.card, styles.open]}
                >
                  <Text style={styles.openLabel}>{card.label}</Text>
                  <Text style={styles.detail}>{card.detail}</Text>
                </Animated.View>
              ) : (
                <View style={[styles.card, styles.closed]}>
                  <Glyph name={card.icon} size={34} color={colors.mintInk} />
                  <Text style={styles.label}>{card.label}</Text>
                  <Text style={styles.tap}>Tap to reveal</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.count}>
        {revealed.length} of {step.cards.length} revealed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cell: { width: '48.5%' },
  card: { minHeight: 150, padding: 14, borderRadius: radius.lg, justifyContent: 'center' },
  closed: { alignItems: 'center', gap: 8, backgroundColor: colors.mint },
  open: { gap: 6, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  label: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  tap: { fontFamily: fonts.medium, fontSize: 12, color: colors.mintInk },
  openLabel: { fontFamily: fonts.heavy, fontSize: 14, color: colors.primary },
  detail: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint, textAlign: 'center' },
});
