import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import SpeechBubble from '@/components/SpeechBubble';
import StepHeader from '@/components/StepHeader';
import { getOnboardingData, setOnboardingData } from '@/lib/onboardingStore';
import { calculateAge, toIsoDate } from '@/lib/dates';
import { colors, fonts, radius, type } from '@/theme';

const DEFAULT_DATE = new Date(2005, 0, 1);

export default function OnboardingDobScreen() {
  const saved = getOnboardingData().dateOfBirth;
  const [date, setDate] = useState<Date | null>(saved ? new Date(saved) : null);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, picked?: Date) {
    setAndroidPickerOpen(false);
    if (event.type === 'set' && picked) setDate(picked);
  }

  function handleContinue() {
    if (!date) return;
    setOnboardingData({ dateOfBirth: toIsoDate(date) });
    router.push('/onboarding/eligibility');
  }

  const age = date ? calculateAge(date) : null;

  return (
    <Screen footer={<Button disabled={!date} onPress={handleContinue}>Continue</Button>}>
      <StepHeader step={2} totalSteps={4} />

      <View style={styles.body}>
        <SpeechBubble>No birthday surprises, promise. This just checks you can join the study.</SpeechBubble>

        <View style={styles.copy}>
          <Text style={type.title}>When’s your birthday?</Text>
          <Text style={type.body}>It won’t be shown publicly.</Text>
        </View>

        {Platform.OS === 'ios' ? (
          <View style={styles.card}>
            <DateTimePicker
              value={date ?? DEFAULT_DATE}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, picked) => picked && setDate(picked)}
              textColor={colors.ink}
            />
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose your birthday"
              onPress={() => setAndroidPickerOpen(true)}
              style={styles.field}
            >
              <Text style={[styles.fieldText, !date && { color: colors.inkFaint }]}>
                {date
                  ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Tap to choose a date'}
              </Text>
            </Pressable>
            {androidPickerOpen && (
              <DateTimePicker
                value={date ?? DEFAULT_DATE}
                mode="date"
                maximumDate={new Date()}
                onChange={handleChange}
              />
            )}
          </>
        )}

        {age !== null && (
          <View style={styles.agePill}>
            <Text style={styles.ageText}>You’re {age}</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  copy: { gap: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  field: {
    height: 58,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldText: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink },
  agePill: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ageText: { fontFamily: fonts.bold, fontSize: 15, color: colors.mintInk },
});
