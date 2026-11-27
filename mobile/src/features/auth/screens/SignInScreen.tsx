import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import SpeechBubble from '@/components/mascot/SpeechBubble';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { homeFor, useCheckEmail, useLogin } from '@/features/auth';
import FormError from '@/features/auth/components/FormError';
import { isEmail } from '@/features/auth/utils/email';
import { hasPin } from '@/features/auth/store/pinStore';
import { pullStudentToPhone, resumeRoute } from '@/features/onboarding';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function SignInScreen() {
  // Coming back from a password reset, the email is filled in and the password step is open.
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(Boolean(params.email));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkEmail = useCheckEmail();
  const login = useLogin();
  const busy = checkEmail.isPending || login.isPending;
  const emailValid = isEmail(email);
  const canSubmit = emailValid && (!hasAccount || password.length > 0) && !busy;

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
      checkEmail.mutate(trimmed, {
        onSuccess: ({ exists }) => {
          if (exists) setHasAccount(true);
          else router.push({ pathname: '/auth/create-password', params: { email: trimmed } });
        },
        onError: (apiError) => setError(apiError.message),
      });
      return;
    }

    login.mutate(
      { email: trimmed, password },
      {
        onSuccess: async (user) => {
          haptics.success();
          if (user.role === 'student') {
            await pullStudentToPhone();
            const resume = await resumeRoute();
            if (resume) return router.replace(resume);
          }
          // A new device has no PIN yet, so set one up once before going in.
          router.replace(hasPin() ? homeFor(user.role) : '/auth/create-pin');
        },
        onError: (apiError) => {
          haptics.error();
          setError(
            apiError.code === 'AUTH_INVALID_CREDENTIALS'
              ? 'That password isn’t right. Try again or reset it.'
              : apiError.message
          );
        },
      }
    );
  }

  return (
    <Screen
      footer={
        <Button disabled={!canSubmit} onPress={handleSubmit}>
          {busy ? 'One moment…' : hasAccount ? 'Sign in' : 'Continue'}
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

          <FormError message={error} />
        </Animated.View>

        {hasAccount && (
          <Animated.View entering={FadeIn.delay(150)}>
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({ pathname: '/auth/forgot-password', params: { email: email.trim() } })
              }
              style={styles.forgot}
              hitSlop={8}
            >
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
  forgot: { alignSelf: 'flex-start' },
  forgotLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
