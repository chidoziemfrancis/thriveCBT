import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { useResendCode, useVerifyEmail } from '@/features/auth';
import CodeInput, { CODE_LENGTH } from '@/features/auth/components/CodeInput';
import FormError from '@/features/auth/components/FormError';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function VerifyEmailScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const verify = useVerifyEmail();
  const resend = useResendCode();
  const ready = code.length === CODE_LENGTH && !verify.isPending;

  function handleVerify() {
    if (!ready) return;
    verify.mutate(code, {
      onSuccess: () => {
        haptics.success();
        router.push('/auth/invite-code');
      },
      onError: () => {
        haptics.error();
        setCode('');
      },
    });
  }

  function handleResend() {
    verify.reset();
    setCode('');
    resend.mutate();
  }

  return (
    <Screen
      footer={
        <Button disabled={!ready} onPress={handleVerify} loading={verify.isPending}>
          Verify
        </Button>
      }
    >
      <BackButton />
      <View style={styles.body}>
        <Text style={type.title}>Check your inbox</Text>
        <Text style={type.body}>
          We sent a {CODE_LENGTH}-digit code to <Text style={styles.email}>{email}</Text>.
        </Text>
        <CodeInput value={code} onChange={setCode} />
        <FormError message={verify.error?.message ?? resend.error?.message} />
        <Pressable
          accessibilityRole="button"
          disabled={resend.isPending}
          onPress={handleResend}
          style={styles.resend}
          hitSlop={8}
        >
          <Text style={styles.resendLabel}>
            {resend.isPending ? 'Sending…' : resend.isSuccess ? 'New code sent' : 'Send a new code'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 16 },
  email: { fontFamily: fonts.bold, color: colors.ink },
  resend: { alignSelf: 'flex-start', marginTop: 4 },
  resendLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
