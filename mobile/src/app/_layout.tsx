import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { Geist_700Bold } from '@expo-google-fonts/geist/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AnimatedSplash, { SplashRevealedProvider } from '@/components/splash/AnimatedSplash';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });
  const [splashRevealed, setSplashRevealed] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const revealApp = useCallback(() => setSplashRevealed(true), []);
  const finishSplash = useCallback(() => setSplashDone(true), []);

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
          <Stack.Screen name="assessment/phq9/results" options={{ gestureEnabled: false }} />
        </Stack>
      </SplashRevealedProvider>
      {!splashDone && <AnimatedSplash onReveal={revealApp} onFinish={finishSplash} />}
    </GestureHandlerRootView>
  );
}
