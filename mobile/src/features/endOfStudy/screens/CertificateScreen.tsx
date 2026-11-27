import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { getBaselinePhq9, getFinalPhq9 } from '@/features/assessment';
import Rosette from '@/features/endOfStudy/components/Rosette';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { SESSIONS } from '@/features/sessions/constants/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const KEEP = [
  { label: 'Your staying-well plan', href: '/staying-well' },
  { label: 'Your toolkit', href: '/toolkit' },
  { label: 'Your crisis plan', href: '/crisis-plan' },
] as const;

function longDate(iso: string, withYear: boolean) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  });
}

/**
 * S41: proof of finishing, kept in the app. It never mentions depression, in case someone sees
 * it over the student's shoulder, and there's no share button for the same reason.
 */
export default function CertificateScreen() {
  const [{ name, from, to }] = useState(() => ({
    name: getOnboardingData().name,
    from: getBaselinePhq9()?.at,
    to: getFinalPhq9()?.at ?? new Date().toISOString(),
  }));

  return (
    <Screen footer={<Button onPress={() => router.replace('/dashboard')}>Back to home</Button>}>
      <BackButton />
      <View style={styles.body}>
        <Animated.View entering={ZoomIn.duration(450)} style={styles.certificate}>
          <View style={styles.inner}>
            <Rosette size={64} />
            <Text style={type.eyebrow}>Certificate of completion</Text>
            <Text style={styles.name}>{name || 'ThriveCBT graduate'}</Text>
            <View style={styles.rule} />
            <Text style={styles.what}>
              completed the {SESSIONS.length}-week ThriveCBT programme
            </Text>
            <Text style={type.caption}>
              {from ? `${longDate(from, false)} – ${longDate(to, true)}` : longDate(to, true)}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[type.eyebrow, styles.section]}>Yours to keep</Text>
          {KEEP.map((item, i) => (
            <Pressable
              key={item.href}
              accessibilityRole="button"
              onPress={() => {
                haptics.tap();
                router.push(item.href);
              }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.divider,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.check}>
                <CheckIcon size={11} color={colors.onPrimary} />
              </View>
              <Text style={styles.rowText}>{item.label}</Text>
              <ChevronRightIcon size={14} color={colors.inkFaint} />
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 26, marginTop: 16 },
  certificate: {
    padding: 8,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inner: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontFamily: fonts.heavy, fontSize: 26, color: colors.ink, textAlign: 'center' },
  rule: { width: '55%', height: 1, backgroundColor: colors.border },
  what: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  section: { marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
});
