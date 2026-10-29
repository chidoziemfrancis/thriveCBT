import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import { HeartHandIcon, PhoneIcon, ShieldIcon } from '@/components/icons';
import Mascot from '@/components/mascot/Mascot';
import Screen from '@/components/ui/Screen';
import { clearAnswers, getAnswers } from '@/features/assessment/assessmentStore';
import { haptics } from '@/lib/haptics';
import { PHQ9_QUESTIONS, SUICIDAL_IDEATION_INDEX, severityBand } from '@/features/assessment/phq9';
import { colors, fonts, radius, type } from '@/theme';

const BANDS = ['Minimal', 'Mild', 'Moderate', 'Moderately severe', 'Severe'];

const SUPPORT_OPTIONS = [
  { label: 'Your campus counselling centre', Icon: ShieldIcon },
  { label: 'A local crisis helpline', Icon: PhoneIcon },
  { label: 'The research team supporting this study', Icon: HeartHandIcon },
];

export default function Phq9ResultsScreen() {
  const [{ score, needsSupport }] = useState(() => {
    const answers = getAnswers();
    return {
      score: answers.reduce((sum, value) => sum + (value ?? 0), 0),
      needsSupport: (answers[SUICIDAL_IDEATION_INDEX] ?? 0) > 0,
    };
  });

  // The crisis screen stays still on purpose: a celebratory buzz there would feel wrong.
  useEffect(() => {
    if (needsSupport) return;
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, [needsSupport]);

  function handleContinue() {
    clearAnswers();
    router.replace('/assignment/finding');
  }

  if (needsSupport) {
    return (
      <Screen footer={<Button onPress={handleContinue}>Continue</Button>}>
        <View style={styles.body}>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
            <Mascot size={112} mood="calm" />
          </Animated.View>

          <View style={styles.copy}>
            <Text style={[type.title, styles.centerText]}>You’re not alone</Text>
            <Text style={[type.body, styles.centerText]}>
              You shared that you’ve had thoughts of hurting yourself or being better off dead.
              Thank you for being honest. This matters, and support is available right now.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Please reach out to one of these:</Text>
            {SUPPORT_OPTIONS.map(({ label, Icon }) => (
              <View key={label} style={styles.supportRow}>
                <View style={styles.supportIcon}>
                  <Icon size={18} color={colors.danger} />
                </View>
                <Text style={styles.supportLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  const band = severityBand(score);
  const bandIndex = BANDS.indexOf(band);

  return (
    <Screen footer={<Button onPress={handleContinue}>Meet my researcher</Button>}>
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={112} mood="cheer" />
        </Animated.View>

        <View style={styles.copy}>
          <Text style={[type.title, styles.centerText]}>Check-in complete</Text>
          <Text style={[type.body, styles.centerText]}>
            Thanks for answering honestly. This is your starting point, and we’ll check in again at
            the end.
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.card}>
          <Text style={type.eyebrow}>Where you’re starting</Text>
          <Text style={styles.band}>{band}</Text>

          <View style={styles.meter} accessibilityElementsHidden>
            {BANDS.map((name, i) => (
              <View
                key={name}
                style={[styles.segment, i <= bandIndex && { backgroundColor: colors.primary }]}
              />
            ))}
          </View>

          <Text style={type.caption}>
            Score {score} of {PHQ9_QUESTIONS.length * 3}
          </Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: 24, paddingTop: 24 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  copy: { gap: 8 },
  card: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  band: { fontFamily: fonts.heavy, fontSize: 30, color: colors.ink },
  meter: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportLabel: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
