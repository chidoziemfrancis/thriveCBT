import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { isEmail } from '@/features/auth/email';
import { type } from '@/theme';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const valid = isEmail(email);

  function sendCode() {
    if (!valid) return;
    router.push({ pathname: '/auth/reset-password', params: { email: email.trim() } });
  }

  return (
    <Screen
      footer={
        <Button disabled={!valid} onPress={sendCode}>
          Send code
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
            onChangeText={setEmail}
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 8 },
  field: { marginTop: 16 },
});
