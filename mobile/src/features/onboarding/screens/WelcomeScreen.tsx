import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import Mascot from '@/components/mascot/Mascot';
import Screen from '@/components/ui/Screen';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

// Lands the heartbeat as Sprout's spring-in settles.
const MASCOT_LANDS_MS = 450;

export default function WelcomeScreen() {
  useEffect(() => {
    const timer = setTimeout(haptics.heartbeat, MASCOT_LANDS_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen
      footer={
        <>
          <Button onPress={() => router.push('/auth/sign-in')}>Get started</Button>
          <Button variant="ghost" onPress={() => router.push('/auth/sign-in')}>
            I already have an account
          </Button>
          <Text style={styles.legal}>
            By continuing, you agree to our <Text style={styles.link}>Terms of Use</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </>
      }
    >
      <View style={styles.hero}>
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <Mascot size={168} mood="cheer" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.copy}>
          <Text style={styles.brand}>
            Thrive<Text style={{ color: colors.primary }}>CBT</Text>
          </Text>
          <Text style={[type.body, styles.tagline]}>
            Your pocket guide for tough weeks. 8 short sessions, built for students.
          </Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  copy: { alignItems: 'center', gap: 10 },
  brand: { fontFamily: fonts.heavy, fontSize: 40, color: colors.ink },
  tagline: { textAlign: 'center', maxWidth: 300 },
  legal: { ...type.caption, textAlign: 'center' },
  link: { fontFamily: fonts.bold, color: colors.primary },
});
