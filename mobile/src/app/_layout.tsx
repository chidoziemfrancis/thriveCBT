import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
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
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_700Bold,
    Figtree_800ExtraBold,
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
          <Stack.Screen name="call/live" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="call/feedback" options={{ gestureEnabled: false }} />
          <Stack.Screen name="session/[id]/complete" options={{ gestureEnabled: false }} />
        </Stack>
      </SplashRevealedProvider>
      {!splashDone && <AnimatedSplash onReveal={revealApp} onFinish={finishSplash} />}
    </GestureHandlerRootView>
  );
}
