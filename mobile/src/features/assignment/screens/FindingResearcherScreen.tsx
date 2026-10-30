import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { assignResearcher } from '@/features/assignment/assign';
import { getAssignment, saveAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { getUserSession } from '@/features/auth/userSession';
import { colors, type } from '@/theme';

// Long enough to read the message and feel the match is considered, short enough not to drag.
const SEARCH_MS = 2200;

function PulseRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - progress.value),
    transform: [{ scale: 0.8 + progress.value * 0.9 }],
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

export default function FindingResearcherScreen() {
  const reduceMotion = useReducedMotion();
  const [noneAvailable, setNoneAvailable] = useState(false);

  useEffect(() => {
    if (getAssignment()) {
      router.replace('/assignment/meet');
      return;
    }

    const timer = setTimeout(() => {
      const result = assignResearcher(MOCK_RESEARCHERS, getUserSession().inviteCode);
      if (!result) {
        setNoneAvailable(true);
        return;
      }
      saveAssignment(result.researcher.id, result.method);
      router.replace('/assignment/meet');
    }, SEARCH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (noneAvailable) {
    return (
      <Screen footer={<Button onPress={() => router.replace('/dashboard')}>Go to my home</Button>}>
        <Animated.View entering={FadeIn} style={styles.body}>
          <Mascot size={120} mood="calm" />
          <Text style={[type.title, styles.center]}>Your researcher is on the way</Text>
          <Text style={[type.body, styles.center]}>
            Everyone on the team is fully booked right now. We’ll match you as soon as a space opens
            and let you know. You can start exploring in the meantime.
          </Text>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.body} accessibilityLiveRegion="polite">
        <View style={styles.mascotWrap}>
          {!reduceMotion && (
            <>
              <PulseRing delay={0} />
              <PulseRing delay={600} />
            </>
          )}
          <Mascot size={120} mood="happy" />
        </View>
        <Text style={[type.title, styles.center]}>Finding your researcher</Text>
        <Text style={[type.body, styles.center]}>
          Every student is paired with someone from the research team who checks in each week.
        </Text>
      </View>
    </Screen>
  );
}

const RING = 150;

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  center: { textAlign: 'center' },
  mascotWrap: {
    width: RING * 1.4,
    height: RING * 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
