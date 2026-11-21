import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import ConsentChecklist, { noneTicked } from '@/features/consent/components/ConsentChecklist';
import DraftTag from '@/features/consent/components/DraftTag';
import { CONSENT_VERSION } from '@/features/consent/consentContent';
import { recordConsent } from '@/features/consent/consentStore';
import { haptics } from '@/lib/haptics';
import { type } from '@/theme';

export default function ConsentScreen() {
  const [ticked, setTicked] = useState(noneTicked);
  const allTicked = ticked.every(Boolean);

  function handleAgree() {
    if (!allTicked) return;
    recordConsent(CONSENT_VERSION);
    haptics.success();
    router.push('/onboarding/name');
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={!allTicked} onPress={handleAgree}>
            I give my consent
          </Button>
          <Button variant="ghost" onPress={() => router.back()}>
            Read the study information again
          </Button>
        </>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.copy}>
          <DraftTag />
          <Text style={type.title}>Your consent</Text>
          <Text style={type.body}>Tick each one to confirm. You can withdraw at any time.</Text>
        </View>
        <ConsentChecklist ticked={ticked} onChange={setTicked} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  copy: { gap: 10 },
});
