import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { COPING_CARDS, copingCard } from '@/features/coping/coping';
import CopingCardRow from '@/features/coping/components/CopingCardRow';
import HelpedChoice from '@/features/coping/components/HelpedChoice';
import {
  logToolUse,
  toggleTool,
  useToolUses,
  useToolkit,
  type ToolUse,
} from '@/features/coping/copingStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

/** The card that has helped most often, counting "a lot" twice. */
function mostHelpful(uses: ToolUse[]) {
  const scores = new Map<string, number>();
  for (const u of uses) scores.set(u.cardId, (scores.get(u.cardId) ?? 0) + u.helped);
  const [best] = [...scores.entries()].filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
  return best ? copingCard(best[0]) : undefined;
}

/** The coping cards the student saved, with a way to try one and say whether it helped. */
export default function ToolkitScreen() {
  const saved = useToolkit();
  const uses = useToolUses();
  const [using, setUsing] = useState<string | null>(null);
  const [thanked, setThanked] = useState<string | null>(null);
  const best = mostHelpful(uses);
  const more = COPING_CARDS.filter((c) => !saved.includes(c.id));

  return (
    <Screen footer={<Button onPress={() => router.push('/stress-log')}>Stress log</Button>}>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>My toolkit</Text>
        <Text style={styles.meta}>
          {best
            ? `Helped you most so far: ${best.title}`
            : 'Ways to cope when stress builds up. Try one, then say if it helped.'}
        </Text>
      </View>

      <Text style={styles.section}>Saved</Text>
      {saved.length === 0 && (
        <Text style={styles.empty}>Nothing saved yet. Add a few from below.</Text>
      )}
      {saved.map((id, i) => {
        const card = copingCard(id);
        if (!card) return null;
        return (
          <View key={id} style={i > 0 && styles.divider}>
            <CopingCardRow card={card} saved onToggle={() => toggleTool(id)}>
              {using === id ? (
                <Animated.View entering={FadeIn.duration(250)} style={styles.helped}>
                  <HelpedChoice
                    onPick={(helped) => {
                      logToolUse(id, helped);
                      setUsing(null);
                      setThanked(id);
                    }}
                  />
                </Animated.View>
              ) : thanked === id ? (
                <Text style={styles.thanks}>Noted. Thanks.</Text>
              ) : (
                <View style={styles.actions}>
                  {card.href && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        haptics.tick();
                        router.push(card.href!);
                      }}
                      style={styles.action}
                    >
                      <Text style={styles.actionText}>Try it</Text>
                    </Pressable>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      haptics.tick();
                      setUsing(id);
                      setThanked(null);
                    }}
                    style={styles.action}
                  >
                    <Text style={styles.actionText}>I used this</Text>
                  </Pressable>
                </View>
              )}
            </CopingCardRow>
          </View>
        );
      })}

      {more.length > 0 && (
        <>
          <Text style={[styles.section, styles.moreTitle]}>More ideas</Text>
          {more.map((card, i) => (
            <View key={card.id} style={i > 0 && styles.divider}>
              <CopingCardRow card={card} saved={false} onToggle={() => toggleTool(card.id)} />
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  section: {
    marginTop: 24,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  moreTitle: { marginTop: 32 },
  empty: { marginTop: 8, fontFamily: fonts.medium, fontSize: 14, color: colors.inkFaint },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  helped: { marginTop: 8 },
  thanks: { marginTop: 6, fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
});
