import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import SpeechBubble from '@/components/mascot/SpeechBubble';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { accountExists, signIn } from '@/features/auth/mockAccounts';
import { hasPin } from '@/features/auth/pinStore';
import { homeFor } from '@/features/auth/roles';
import { setUserSession } from '@/features/auth/userSession';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const canSubmit = emailValid && (!hasAccount || password.length > 0);

  function handleEmailChange(value: string) {
    setEmail(value);
    // A different email may belong to a different account, so the password step starts over.
    setHasAccount(false);
    setPassword('');
    setError(null);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const trimmed = email.trim();

    if (!hasAccount) {
      if (accountExists(trimmed)) {
        setHasAccount(true);
        return;
      }
      setUserSession({ email: trimmed, role: 'student' });
      router.push({ pathname: '/auth/create-password', params: { email: trimmed } });
      return;
    }

    const role = signIn(trimmed, password);
    if (!role) {
      haptics.error();
      setError('That password isn’t right. Try again or reset it.');
      return;
    }

    haptics.success();
    setUserSession({ email: trimmed, role });
    // A new device has no PIN yet, so set one up once before going in.
    router.replace(hasPin() ? homeFor(role) : '/auth/create-pin');
  }

  return (
    <Screen
      footer={
        <Button disabled={!canSubmit} onPress={handleSubmit}>
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
          {hasAccount ? 'Welcome back' : 'What’s your email?'}
        </Text>

        <Animated.View layout={LinearTransition.springify()} style={styles.fields}>
          <TextField
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType={hasAccount ? 'next' : 'go'}
            onSubmitEditing={handleSubmit}
          />

          {hasAccount && (
            <Animated.View entering={FadeInDown.springify().damping(16)}>
              <TextField
                label="Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                textContentType="password"
                autoFocus
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                style={[styles.passwordInput, error && styles.inputError]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((v) => !v)}
                style={styles.toggle}
                hitSlop={8}
              >
                <Text style={styles.toggleLabel}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </Animated.View>
          )}

          {error && (
            <Animated.Text
              entering={FadeIn.duration(200)}
              style={styles.error}
              accessibilityLiveRegion="assertive"
            >
              {error}
            </Animated.Text>
          )}
        </Animated.View>

        {hasAccount && (
          <Animated.View entering={FadeIn.delay(150)}>
            <Pressable accessibilityRole="link" style={styles.forgot} hitSlop={8}>
              <Text style={styles.forgotLabel}>Forgot password?</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  title: { marginTop: 4 },
  fields: { gap: 16 },
  passwordInput: { paddingRight: 72 },
  inputError: { borderColor: colors.danger },
  toggle: { position: 'absolute', right: 18, bottom: 19 },
  toggleLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  error: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.danger },
  forgot: { alignSelf: 'flex-start' },
  forgotLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
