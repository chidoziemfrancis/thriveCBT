import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import BirthdayPicker from '@/components/BirthdayPicker';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import SpeechBubble from '@/components/SpeechBubble';
import StepHeader from '@/components/StepHeader';
import { DateParts, calculateAge, parseIsoDate, toIsoDate } from '@/lib/dates';
import { getOnboardingData, setOnboardingData } from '@/lib/onboardingStore';
import { colors, fonts, radius, type } from '@/theme';

export default function OnboardingDobScreen() {
  const [parts, setParts] = useState<DateParts>(() =>
    parseIsoDate(getOnboardingData().dateOfBirth)
  );

  const { year, month, day } = parts;
  const date =
    year !== undefined && month !== undefined && day !== undefined
      ? new Date(year, month, day)
      : null;

  function handleContinue() {
    if (!date) return;
    setOnboardingData({ dateOfBirth: toIsoDate(date) });
    router.push('/onboarding/eligibility');
  }

  return (
    <Screen
      footer={
        <Button disabled={!date} onPress={handleContinue}>
          Continue
        </Button>
      }
    >
      <StepHeader step={2} totalSteps={4} />

      <View style={styles.body}>
        <SpeechBubble>
          No birthday surprises, promise. This just checks you can join the study.
        </SpeechBubble>

        <View style={styles.titleRow}>
          <Text style={[type.title, styles.title]}>When’s your birthday?</Text>
          {date && (
            <Animated.View entering={ZoomIn.springify()} style={styles.agePill}>
              <Text style={styles.ageText}>You’re {calculateAge(date)}</Text>
            </Animated.View>
          )}
        </View>

        <BirthdayPicker value={parts} onChange={setParts} />

        <Text style={[type.caption, styles.private]}>It won’t be shown publicly.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flexShrink: 1 },
  agePill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ageText: { fontFamily: fonts.heavy, fontSize: 14, color: colors.mintInk },
  private: { textAlign: 'center' },
});
