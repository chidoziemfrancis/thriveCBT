import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackButton from '@/components/ui/BackButton';
import Keypad from '@/features/auth/components/Keypad';
import PinBoxes from '@/features/auth/components/PinBoxes';
import { PIN_LENGTH } from '@/features/auth/pin';
import { checkPin } from '@/features/auth/pinStore';
import { signOut } from '@/features/auth/signOut';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

/** Confirms the current PIN before letting anyone set a new one. */
export default function ChangePinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [checking, setChecking] = useState(false);

  async function handleComplete(entered: string) {
    setChecking(true);
    const result = await checkPin(entered);
    setChecking(false);

    if (result.ok) {
      haptics.success();
      router.replace({ pathname: '/auth/create-pin', params: { mode: 'change' } });
      return;
    }

    haptics.error();
    setShakeKey((k) => k + 1);
    setPin('');
    if (result.attemptsLeft === 0) {
      await signOut();
      router.dismissAll();
      router.replace('/auth/sign-in');
      return;
    }
    setError(
      `Wrong PIN. ${result.attemptsLeft} ${result.attemptsLeft === 1 ? 'try' : 'tries'} left.`
    );
  }

  function handleDigit(digit: string) {
    if (pin.length >= PIN_LENGTH || checking) return;
    setError(null);
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) handleComplete(next);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <View style={styles.top}>
        <Text style={[type.title, styles.center]}>Enter your current PIN</Text>
        <Text style={[type.body, styles.center]}>Then you can choose a new one.</Text>
        <PinBoxes length={pin.length} shakeKey={shakeKey} error={error !== null} />
        <Text style={styles.error} accessibilityLiveRegion="assertive">
          {error ?? ' '}
        </Text>
      </View>
      <View style={styles.pad}>
        <Keypad
          onDigit={handleDigit}
          onDelete={() => setPin((p) => p.slice(0, -1))}
          disabled={checking}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 24 },
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
