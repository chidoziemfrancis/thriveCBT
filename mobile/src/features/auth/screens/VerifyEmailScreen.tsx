import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import CodeInput, { CODE_LENGTH } from '@/features/auth/components/CodeInput';
import { colors, fonts, type } from '@/theme';

export default function VerifyEmailScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');

  return (
    <Screen
      footer={
        <Button
          disabled={code.length < CODE_LENGTH}
          onPress={() => router.push('/auth/invite-code')}
        >
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 16 },
  email: { fontFamily: fonts.bold, color: colors.ink },
});
