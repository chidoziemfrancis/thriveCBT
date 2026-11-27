import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { useRequestReset } from '@/features/auth';
import FormError from '@/features/auth/components/FormError';
import { isEmail } from '@/features/auth/email';
import { type } from '@/theme';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const request = useRequestReset();
  const valid = isEmail(email) && !request.isPending;

  function sendCode() {
    if (!valid) return;
    const trimmed = email.trim();
    request.mutate(trimmed, {
      onSuccess: () =>
        router.push({ pathname: '/auth/reset-password', params: { email: trimmed } }),
    });
  }

  return (
    <Screen
      footer={
        <Button disabled={!valid} onPress={sendCode}>
          {request.isPending ? 'Sending…' : 'Send code'}
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <Text style={type.title}>Forgot password?</Text>
        <Text style={type.body}>Enter your email and we’ll send you a code to reset it.</Text>
        <View style={styles.field}>
          <TextField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              request.reset();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            autoFocus={!params.email}
            returnKeyType="go"
            onSubmitEditing={sendCode}
          />
        </View>
        <FormError message={request.error?.message} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 8 },
  field: { marginTop: 16 },
});
