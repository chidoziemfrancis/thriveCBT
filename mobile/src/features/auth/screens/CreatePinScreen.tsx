import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import SproutMark from '@/components/mascot/SproutMark';
import Keypad from '@/features/auth/components/Keypad';
import PinBoxes from '@/features/auth/components/PinBoxes';
import { PIN_LENGTH, isWeakPin } from '@/features/auth/pin';
import { savePin } from '@/features/auth/pinStore';
import { homeFor } from '@/features/auth/roles';
import { getUserSession } from '@/features/auth/userSession';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

type Step = 'create' | 'confirm';

export default function CreatePinScreen() {
  const [step, setStep] = useState<Step>('create');
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [saving, setSaving] = useState(false);

  function fail(message: string) {
    haptics.error();
    setError(message);
    setShakeKey((k) => k + 1);
    setPin('');
  }

  async function handleComplete(entered: string) {
    if (step === 'create') {
      if (isWeakPin(entered)) {
        fail('That one’s too easy to guess. Try a less obvious PIN.');
        return;
      }
      setFirst(entered);
      setPin('');
      setStep('confirm');
      return;
    }

    if (entered !== first) {
      setStep('create');
      setFirst('');
      fail('Those didn’t match. Let’s start again.');
      return;
    }

    setSaving(true);
    await savePin(entered);
    haptics.success();
    router.replace(homeFor(getUserSession().role ?? 'student'));
  }

  function handleDigit(digit: string) {
    if (pin.length >= PIN_LENGTH || saving) return;
    setError(null);
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) handleComplete(next);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <SproutMark width={64} leaf={colors.primary} accent={colors.primaryEdge} />
        <Animated.View key={step} entering={FadeIn.duration(220)} style={styles.copy}>
          <Text style={[type.title, styles.center]}>
            {step === 'create' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}
          </Text>
          <Text style={[type.body, styles.center]}>
            {step === 'create'
              ? 'You’ll use it to open ThriveCBT, so your journal and chats stay private.'
              : 'Enter the same PIN again.'}
          </Text>
        </Animated.View>

        <PinBoxes length={pin.length} shakeKey={shakeKey} error={error !== null} />
        <Text style={styles.error} accessibilityLiveRegion="assertive">
          {error ?? ' '}
        </Text>
      </View>

      <View style={styles.pad}>
        <Keypad
          onDigit={handleDigit}
          onDelete={() => setPin((p) => p.slice(0, -1))}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 },
  copy: { gap: 8, alignItems: 'center' },
  center: { textAlign: 'center' },
  error: {
    minHeight: 20,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  pad: { paddingHorizontal: 32, paddingBottom: 16 },
});
