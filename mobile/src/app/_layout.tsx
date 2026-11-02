import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AnimatedSplash, { SplashRevealedProvider } from '@/components/splash/AnimatedSplash';
import { useRelockOnResume } from '@/features/auth/useRelockOnResume';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashRevealed, setSplashRevealed] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const revealApp = useCallback(() => setSplashRevealed(true), []);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  useRelockOnResume();

  // A font that fails to load falls back to the system font rather than holding the
  // native splash on screen forever.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={splashRevealed ? 'dark' : 'light'} />
      <SplashRevealedProvider value={splashRevealed}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/unlock" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="auth/create-pin" options={{ gestureEnabled: false }} />
          <Stack.Screen name="assessment/phq9/results" options={{ gestureEnabled: false }} />
          <Stack.Screen name="assignment/finding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="assignment/meet" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="support" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile/withdrawn" options={{ gestureEnabled: false }} />
          <Stack.Screen name="call/live" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="call/feedback" options={{ gestureEnabled: false }} />
          <Stack.Screen name="session/[id]/complete" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="entry/write"
            options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
          />
        </Stack>
      </SplashRevealedProvider>
      {!splashDone && <AnimatedSplash onReveal={revealApp} onFinish={finishSplash} />}
    </GestureHandlerRootView>
  );
}
