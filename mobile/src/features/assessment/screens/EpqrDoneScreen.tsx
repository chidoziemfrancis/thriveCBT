import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import SupportCard from '@/features/assessment/components/SupportCard';
import { getEpqrResult } from '@/features/assessment/epqrStore';
import { haptics } from '@/lib/haptics';
import { type } from '@/theme';

/**
 * The end of the questionnaire. Scores go to the researcher only; a Yes to having wished to be
 * dead gets the same support screen as PHQ-9 question 9.
 */
export default function EpqrDoneScreen() {
  const [wishedDead] = useState(() => getEpqrResult()?.wishedDead ?? false);

  useEffect(() => {
    if (wishedDead) return;
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, [wishedDead]);

  const footer = (
    <Button onPress={() => router.replace('/assignment/finding')}>
      {wishedDead ? 'Continue' : 'Meet my researcher'}
    </Button>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={112} mood={wishedDead ? 'calm' : 'cheer'} />
        </Animated.View>
        {wishedDead ? (
          <>
            <View style={styles.copy}>
              <Text style={[type.title, styles.centerText]}>You’re not alone</Text>
              <Text style={[type.body, styles.centerText]}>
                You shared that you’ve wished you were dead. Thank you for being honest. Your
                researcher will see this and check in with you, and support is available right now.
              </Text>
            </View>
            <SupportCard />
          </>
        ) : (
          <View style={styles.copy}>
            <Text style={[type.title, styles.centerText]}>That’s everything</Text>
            <Text style={[type.body, styles.centerText]}>
              Thanks for answering all of those. Next, you’ll meet the researcher who’ll support you
              through the eight weeks.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: 24, paddingTop: 24 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  copy: { gap: 8 },
});
