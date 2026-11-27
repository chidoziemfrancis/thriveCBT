import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { useRegister } from '@/features/auth';
import FormError from '@/features/auth/components/FormError';
import NewPasswordField from '@/features/auth/components/NewPasswordField';
import { isPasswordValid } from '@/features/auth/utils/password';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function CreatePasswordScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const register = useRegister();
  const valid = isPasswordValid(password);

  function handleContinue() {
    if (!valid || register.isPending) return;
    register.mutate(
      { email, password },
      {
        onSuccess: () => router.push({ pathname: '/auth/verify-email', params: { email } }),
        onError: () => haptics.error(),
      }
    );
  }

  return (
    <Screen
      footer={
        <Button disabled={!valid || register.isPending} onPress={handleContinue}>
          {register.isPending ? 'Creating your account…' : 'Create account'}
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
          onChange={(value) => {
            setPassword(value);
            register.reset();
          }}
          onSubmit={handleContinue}
          autoFocus
        />
        <FormError message={register.error?.message} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 20 },
  copy: { gap: 8 },
  email: { fontFamily: fonts.bold, color: colors.ink },
});
