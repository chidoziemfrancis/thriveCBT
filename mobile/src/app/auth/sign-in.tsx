import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import SpeechBubble from '@/components/SpeechBubble';
import TextField from '@/components/TextField';
import { accountExists } from '@/lib/mockAccounts';
import { setUserSession } from '@/lib/userSession';
import { colors, fonts, type } from '@/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  function handleSubmit() {
    if (hasAccount) {
      setUserSession({ email });
      router.replace('/dashboard');
      return;
    }

    if (accountExists(email)) {
      setHasAccount(true);
      return;
    }

    setUserSession({ email });
    router.push({ pathname: '/auth/verify-email', params: { email } });
  }

  return (
    <Screen
      footer={
        <Button
          disabled={!emailValid || (hasAccount && password.length === 0)}
          onPress={handleSubmit}
        >
          {hasAccount ? 'Sign in' : 'Continue'}
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <SpeechBubble>
          {hasAccount
            ? 'Welcome back! Pop in your password and we’ll pick up where you left off.'
            : 'Hey! Let’s start with your email. Use your school one if you have it.'}
        </SpeechBubble>

        <Text style={[type.title, styles.title]}>
          {hasAccount ? 'Sign in' : 'What’s your email?'}
        </Text>

        <View style={styles.fields}>
          <TextField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setHasAccount(false);
            }}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => emailValid && !hasAccount && handleSubmit()}
          />

          {hasAccount && (
            <View>
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                textContentType="password"
                autoFocus
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPassword((v) => !v)}
                style={styles.toggle}
                hitSlop={8}
              >
                <Text style={styles.toggleLabel}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {hasAccount && (
          <Pressable accessibilityRole="link" style={styles.forgot}>
            <Text style={styles.forgotLabel}>Forgot password?</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  title: { marginTop: 4 },
  fields: { gap: 16 },
  toggle: { position: 'absolute', right: 18, bottom: 19 },
  toggleLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  forgot: { alignSelf: 'flex-start' },
  forgotLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
