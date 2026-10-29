import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import ChoiceButton from '@/components/ChoiceButton';
import Screen from '@/components/Screen';
import SpeechBubble from '@/components/SpeechBubble';
import StepHeader from '@/components/StepHeader';
import { getOnboardingData, setOnboardingData } from '@/lib/onboardingStore';
import { type } from '@/theme';

export default function OnboardingEligibilityScreen() {
  const [isUndergraduate, setIsUndergraduate] = useState<boolean | null>(
    () => getOnboardingData().isUndergraduate ?? null
  );

  function handleContinue() {
    if (isUndergraduate === null) return;
    setOnboardingData({ isUndergraduate });
    router.push('/onboarding/what-to-expect');
  }

  return (
    <Screen
      footer={
        <Button disabled={isUndergraduate === null} onPress={handleContinue}>
          Continue
        </Button>
      }
    >
      <StepHeader step={3} totalSteps={4} />

      <View style={styles.body}>
        <SpeechBubble>Quick one, then we’re nearly done.</SpeechBubble>

        <View style={styles.copy}>
          <Text style={type.title}>Are you an undergraduate student right now?</Text>
          <Text style={type.body}>This study is designed for undergrads, so we need to check.</Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          <ChoiceButton
            selected={isUndergraduate === true}
            onPress={() => setIsUndergraduate(true)}
          >
            Yes, I am
          </ChoiceButton>
          <ChoiceButton
            selected={isUndergraduate === false}
            onPress={() => setIsUndergraduate(false)}
          >
            No, I’m not
          </ChoiceButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  copy: { gap: 8 },
  options: { gap: 12 },
});
