import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { PHQ9_QUESTIONS } from '@/features/assessment/phq9';
import { getBaselinePhq9, getFinalPhq9 } from '@/features/assessment/scoreHistory';
import BandMeter from '@/features/endOfStudy/components/BandMeter';
import { OUTCOME_COPY, needsSupport, phq9Outcome } from '@/features/endOfStudy/endOfStudy';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

/** S40: the starting PHQ-9 next to the week-8 one, in words first and never framed as failing. */
export default function ThenAndNowScreen() {
  const [{ start, end }] = useState(() => ({ start: getBaselinePhq9(), end: getFinalPhq9() }));
  if (!start || !end) return <Redirect href="/dashboard" />;

  const outcome = phq9Outcome(start.score, end.score);
  const copy = OUTCOME_COPY[outcome];
  const support = needsSupport(start.score, end.score);

  return (
    <Screen
      footer={
        <Button onPress={() => router.push('/end-of-study/certificate')}>
          See your certificate
        </Button>
      }
    >
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={[type.eyebrow, styles.green]}>Then and now</Text>
          <Text style={type.title}>{copy.title}</Text>
        </View>

        {support && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              haptics.tap();
              router.push('/support');
            }}
            style={({ pressed }) => [styles.support, pressed && { opacity: 0.85 }]}
          >
            <Glyph name="shield" size={20} color={colors.danger} />
            <View style={styles.supportText}>
              <Text style={styles.supportTitle}>Talk to someone now</Text>
              <Text style={styles.supportMeta}>Helplines and campus support, any time.</Text>
            </View>
          </Pressable>
        )}

        <Animated.View entering={FadeInDown.delay(150).duration(420)} style={styles.compare}>
          <BandMeter label="Start" score={start.score} at={start.at} muted />
          <BandMeter label="Now" score={end.score} at={end.at} />
          <Text style={type.caption}>
            Score {start.score} then, {end.score} now, out of {PHQ9_QUESTIONS.length * 3}.
          </Text>
        </Animated.View>

        <Text style={type.body}>{copy.body}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 24, paddingTop: 24 },
  copy: { gap: 8 },
  green: { color: colors.primary },
  compare: { gap: 18 },
  support: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  supportText: { flex: 1, gap: 2 },
  supportTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.danger },
  supportMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
