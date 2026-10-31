import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SproutMark from '@/components/mascot/SproutMark';
import Keypad from '@/features/auth/components/Keypad';
import PinBoxes from '@/features/auth/components/PinBoxes';
import { PIN_LENGTH } from '@/features/auth/pin';
import { checkPin } from '@/features/auth/pinStore';
import { homeFor } from '@/features/auth/roles';
import { signOut } from '@/features/auth/signOut';
import { getUserSession } from '@/features/auth/userSession';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function UnlockScreen() {
  // "resume" covers the app coming back from the background; the screen underneath is kept.
  const { mode } = useLocalSearchParams<{ mode?: 'resume' }>();
  const [{ name, role }] = useState(() => ({
    name: getOnboardingData().name,
    role: getUserSession().role ?? 'student',
  }));
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [checking, setChecking] = useState(false);

  // Android's back button must not skip the lock.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  async function goToSignIn() {
    await signOut();
    router.replace('/auth/sign-in');
  }

  async function handleComplete(entered: string) {
    setChecking(true);
    const result = await checkPin(entered);
    setChecking(false);

    if (result.ok) {
      haptics.success();
      if (mode === 'resume' && router.canGoBack()) router.back();
      else router.replace(homeFor(role));
      return;
    }

    haptics.error();
    setShakeKey((k) => k + 1);
    setPin('');
    if (result.attemptsLeft === 0) {
      await goToSignIn();
      return;
    }
    setError(
      `Wrong PIN. ${result.attemptsLeft} ${result.attemptsLeft === 1 ? 'try' : 'tries'} left before you’ll need your password.`
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
      <View style={styles.top}>
        <View style={styles.brand}>
          <SproutMark width={56} leaf={colors.primary} accent={colors.primaryEdge} />
          <Text style={styles.brandText}>
            Thrive<Text style={{ color: colors.primary }}>CBT</Text>
          </Text>
        </View>

        <View style={styles.copy}>
          <Text style={[type.title, styles.center]}>Welcome back{name ? `, ${name}` : ''}.</Text>
          <Text style={[type.body, styles.center]}>Enter your 4-digit PIN</Text>
          <Text style={styles.notYou}>
            Not you?{' '}
            <Text style={styles.link} onPress={goToSignIn} accessibilityRole="link">
              Log out
            </Text>
          </Text>
        </View>

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
        <Pressable accessibilityRole="link" onPress={goToSignIn} style={styles.forgot} hitSlop={8}>
          <Text style={styles.forgotText}>Forgot PIN? Sign in with your password</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 },
  brand: { alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.heavy, fontSize: 28, letterSpacing: -0.5, color: colors.ink },
  copy: { gap: 6, alignItems: 'center' },
  center: { textAlign: 'center' },
  notYou: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  link: { fontFamily: fonts.bold, color: colors.primary },
  error: {
    minHeight: 20,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  pad: { paddingHorizontal: 32, paddingBottom: 12, gap: 8 },
  forgot: { alignSelf: 'center', paddingVertical: 8 },
  forgotText: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
});
