import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import NewPasswordField from '@/features/auth/components/NewPasswordField';
import { registerStudent } from '@/features/auth/mockAccounts';
import { isPasswordValid } from '@/features/auth/password';
import { colors, fonts, type } from '@/theme';

export default function CreatePasswordScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const valid = isPasswordValid(password);

  function handleContinue() {
    if (!valid) return;
    registerStudent(email, password);
    router.push({ pathname: '/auth/verify-email', params: { email } });
  }

  return (
    <Screen
      footer={
        <Button disabled={!valid} onPress={handleContinue}>
          Create account
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={type.title}>Create a password</Text>
          <Text style={type.body}>
            For <Text style={styles.email}>{email}</Text>. You’ll use it to sign back in.
          </Text>
        </View>
        <NewPasswordField
          value={password}
          onChange={setPassword}
          onSubmit={handleContinue}
          autoFocus
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  copy: { gap: 8 },
  email: { fontFamily: fonts.bold, color: colors.ink },
});
