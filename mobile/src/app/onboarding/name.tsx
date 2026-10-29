import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import Screen from '@/components/Screen';
import SpeechBubble from '@/components/SpeechBubble';
import StepHeader from '@/components/StepHeader';
import TextField from '@/components/TextField';
import { getOnboardingData, setOnboardingData } from '@/lib/onboardingStore';
import { type } from '@/theme';

export default function OnboardingNameScreen() {
  const [name, setName] = useState(() => getOnboardingData().name ?? '');
  const canContinue = name.trim().length > 0;

  function handleContinue() {
    if (!canContinue) return;
    setOnboardingData({ name: name.trim() });
    router.push('/onboarding/dob');
  }

  return (
    <Screen
      footer={
        <Button disabled={!canContinue} onPress={handleContinue}>
          Continue
        </Button>
      }
    >
      <StepHeader step={1} totalSteps={4} />

      <View style={styles.body}>
        <SpeechBubble>I’m Sprout! I’ll be with you for the next 8 weeks.</SpeechBubble>

        <View style={styles.copy}>
          <Text style={type.title}>What should we call you?</Text>
          <Text style={type.body}>
            Just your first name or a nickname. Only you and your researcher see it.
          </Text>
        </View>

        <TextField
          label="First name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Ada"
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  copy: { gap: 8 },
});
