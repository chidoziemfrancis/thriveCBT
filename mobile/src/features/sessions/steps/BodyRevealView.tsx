import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import BodyFigure, { FIGURE, SPOTS } from '@/features/sessions/art/BodyFigure';
import type { RevealStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const SPOT = 34;

function Pulse() {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduce) t.set(withRepeat(withTiming(1, { duration: 1600 }), -1));
  }, [reduce, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - t.value),
    transform: [{ scale: 1 + t.value * 0.9 }],
  }));
  return <Animated.View style={[styles.pulse, style]} />;
}

/** Tap the glowing spots on a person to see where depression shows up. */
export default function BodyRevealView({
  step,
  revealed,
  onReveal,
}: {
  step: RevealStep;
  revealed: string[];
  onReveal: (ids: string[]) => void;
}) {
  const [shown, setShown] = useState<string | null>(revealed.at(-1) ?? null);
  const card = step.cards.find((c) => c.id === shown);

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>
          Tap each glowing spot. {revealed.length} of {step.cards.length}
        </Text>
      </View>

      <View style={styles.stage}>
        <BodyFigure color={colors.primary} fill={colors.primarySoft} />
        {step.cards.map((c) => {
          if (!c.spot) return null;
          const { x, y } = SPOTS[c.spot];
          const open = revealed.includes(c.id);
          const active = shown === c.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={open ? `${c.label}: ${c.detail}` : `${c.label}, tap to see`}
              hitSlop={10}
              onPress={() => {
                haptics.tap();
                setShown(c.id);
                if (!open) onReveal([...revealed, c.id]);
              }}
              style={[
                styles.spotWrap,
                { left: x * FIGURE.width - SPOT / 2, top: y * FIGURE.height - SPOT / 2 },
              ]}
            >
              {!open && <Pulse />}
              <View style={[styles.spot, open && styles.spotOpen, active && styles.spotActive]}>
                <Glyph name={c.icon} size={16} color={open ? colors.onPrimary : colors.primary} />
              </View>
              <Text style={[styles.tag, x > 0.5 ? styles.tagLeft : styles.tagRight]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {card ? (
        <Animated.View key={card.id} entering={FadeIn.duration(250)} style={styles.detail}>
          <Text style={styles.detailLabel}>{card.label}</Text>
          <Text style={stepText.feedback}>{card.detail}</Text>
        </Animated.View>
      ) : (
        <View style={[styles.detail, styles.detailEmpty]}>
          <Text style={styles.empty}>Start with the head.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 12 },
  stage: { alignSelf: 'center', width: FIGURE.width, height: FIGURE.height },
  spotWrap: {
    position: 'absolute',
    width: SPOT,
    height: SPOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: SPOT,
    height: SPOT,
    borderRadius: SPOT / 2,
    backgroundColor: colors.primary,
  },
  spot: {
    width: SPOT,
    height: SPOT,
    borderRadius: SPOT / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotOpen: { backgroundColor: colors.primary },
  spotActive: { transform: [{ scale: 1.15 }] },
  tag: {
    position: 'absolute',
    width: 110,
    top: 8,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
  tagRight: { left: SPOT + 8 },
  tagLeft: { right: SPOT + 8, textAlign: 'right' },
  detail: {
    minHeight: 84,
    gap: 4,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  detailEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  detailLabel: { fontFamily: fonts.heavy, fontSize: 15, color: colors.primary },
  empty: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
});
