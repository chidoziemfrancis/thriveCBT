import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import CodeInput, { CODE_LENGTH } from '@/features/auth/components/CodeInput';
import NewPasswordField from '@/features/auth/components/NewPasswordField';
import { resetPassword } from '@/features/auth/mockAccounts';
import { isPasswordValid } from '@/features/auth/password';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function ResetPasswordScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const ready = code.length === CODE_LENGTH && isPasswordValid(password);

  function reset() {
    if (!ready) return;
    // Whether the account exists isn't shown, so the screen can't be used to find accounts.
    resetPassword(email, password);
    haptics.success();
    setDone(true);
  }

  function signIn() {
    router.dismissTo({ pathname: '/auth/sign-in', params: { email } });
  }

  if (done) {
    return (
      <Screen footer={<Button onPress={signIn}>Sign in</Button>}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.done}>
          <View style={styles.tick}>
            <CheckIcon size={26} color={colors.onPrimary} />
          </View>
          <Text style={[type.title, styles.center]}>Password changed</Text>
          <Text style={[type.body, styles.center]}>
            Sign in with your new password to carry on where you left off.
          </Text>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button disabled={!ready} onPress={reset}>
          Reset password
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={type.title}>Check your inbox</Text>
          <Text style={type.body}>
            We sent a {CODE_LENGTH}-digit code to <Text style={styles.email}>{email}</Text>.
          </Text>
        </View>
        <CodeInput value={code} onChange={setCode} label="Reset code" />
        <NewPasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          onSubmit={reset}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  copy: { gap: 8 },
  email: { fontFamily: fonts.bold, color: colors.ink },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  tick: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  center: { textAlign: 'center' },
});
