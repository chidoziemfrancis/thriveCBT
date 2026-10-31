import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';

import FeatureIcon from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import type { LessonCard } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function Card({ card }: { card: LessonCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.hero}>
        <FeatureIcon name={card.icon} size={96} />
      </View>
      <Text style={type.title}>{card.title}</Text>
      {card.body && <Text style={styles.body}>{card.body}</Text>}

      {card.bullets && (
        <View style={styles.bullets}>
          {card.bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}

      {card.chips && (
        <View style={styles.chips}>
          {card.chips.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      )}

      {card.video && (
        <View style={styles.video} accessibilityLabel={`${card.video.title}, video coming soon`}>
          <View style={styles.play}>
            <View style={styles.playTriangle} />
          </View>
          <Text style={styles.videoTitle}>{card.video.title}</Text>
          <Text style={styles.videoNote}>Video coming soon</Text>
        </View>
      )}
    </View>
  );
}

/** One idea per card, stepped through like a story so it never feels like a wall of text. */
export default function LessonModule({
  cards,
  onComplete,
}: {
  cards: LessonCard[];
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isLast = index === cards.length - 1;

  function go(step: 1 | -1) {
    haptics.tick();
    setDirection(step);
    setIndex((i) => i + step);
  }

  return (
    <View style={styles.wrap}>
      <Animated.View
        key={index}
        entering={(direction === 1 ? FadeInRight : FadeInLeft).duration(280)}
        style={styles.flex}
      >
        <Card card={cards[index]} />
      </Animated.View>

      <View style={styles.dots} accessibilityLabel={`Card ${index + 1} of ${cards.length}`}>
        {cards.map((card, i) => (
          <View key={card.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button onPress={isLast ? onComplete : () => go(1)}>
          {isLast ? 'Finish lesson' : 'Next'}
        </Button>
        {index > 0 && (
          <Button variant="ghost" onPress={() => go(-1)}>
            Back
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 18 },
  flex: { flex: 1 },
  card: {
    gap: 12,
    padding: 22,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  hero: { alignItems: 'center', paddingVertical: 8 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 25, color: colors.inkMuted },
  bullets: { gap: 10 },
  bulletRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 23,
    color: colors.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.mintInk },
  video: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  play: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    marginLeft: 4,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.onPrimary,
  },
  videoTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  videoNote: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.primary },
  actions: { gap: 4 },
});
