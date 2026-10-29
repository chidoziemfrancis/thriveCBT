import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import SpeechBubble from '@/components/mascot/SpeechBubble';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import StepHeader from '@/components/ui/StepHeader';
import BirthdayWheel, { Birthday } from '@/features/onboarding/components/BirthdayWheel';
import { getOnboardingData, setOnboardingData } from '@/features/onboarding/onboardingStore';
import { calculateAge, parseIsoDate, toIsoDate } from '@/lib/dates';
import { colors, fonts, radius, type } from '@/theme';

const DEFAULT_BIRTHDAY: Birthday = { year: 2005, month: 0, day: 1 };

function savedBirthday(): Birthday | null {
  const { year, month, day } = parseIsoDate(getOnboardingData().dateOfBirth);
  return year !== undefined && month !== undefined && day !== undefined
    ? { year, month, day }
    : null;
}

export default function OnboardingDobScreen() {
  const [saved] = useState(savedBirthday);
  const [birthday, setBirthday] = useState<Birthday>(saved ?? DEFAULT_BIRTHDAY);
  // The wheel always shows a date, so Continue waits until the student has actually moved it;
  // otherwise the default could be saved as a real birthday.
  const [touched, setTouched] = useState(saved !== null);

  const date = new Date(birthday.year, birthday.month, birthday.day);

  function handleContinue() {
    if (!touched) return;
    setOnboardingData({ dateOfBirth: toIsoDate(date) });
    router.push('/onboarding/eligibility');
  }

  return (
    <Screen
      footer={
        <Button disabled={!touched} onPress={handleContinue}>
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
          {touched && (
            <Animated.View entering={ZoomIn.springify()} style={styles.agePill}>
              <Text style={styles.ageText}>You’re {calculateAge(date)}</Text>
            </Animated.View>
          )}
        </View>

        <BirthdayWheel value={birthday} onChange={setBirthday} onTouch={() => setTouched(true)} />

        <Text style={[type.caption, styles.hint]}>
          {touched ? 'It won’t be shown publicly.' : 'Scroll each wheel to your birthday.'}
        </Text>
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
  hint: { textAlign: 'center' },
});
