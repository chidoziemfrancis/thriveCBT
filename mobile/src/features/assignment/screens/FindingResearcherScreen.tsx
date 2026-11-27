import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { getUserSession } from '@/features/auth/store/userSession';
import { afterMatching } from '@/features/onboarding/reminders';
import type { ApiError } from '@/lib/api-error';
import { colors, type } from '@/theme';

import { useAssign } from '../hooks/useAssignment';
import { getAssignment } from '../store/assignmentStore';

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
  const assign = useAssign();
  const [noneAvailable, setNoneAvailable] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { mutate } = assign;

  // The search runs for at least SEARCH_MS even when the server answers sooner, so the match
  // feels considered rather than instant.
  const findResearcher = useCallback(() => {
    const started = Date.now();
    const after = (then: () => void) =>
      setTimeout(then, Math.max(0, SEARCH_MS - (Date.now() - started)));
    mutate(getUserSession().inviteCode, {
      onSuccess: () => after(() => router.replace('/assignment/meet')),
      onError: (apiError) =>
        after(() =>
          apiError.code === 'ASSIGNMENT_NO_RESEARCHER' ? setNoneAvailable(true) : setError(apiError)
        ),
    });
  }, [mutate]);

  useEffect(() => {
    if (getAssignment()) {
      router.replace('/assignment/meet');
      return;
    }
    findResearcher();
  }, [findResearcher]);

  if (error) {
    return (
      <Screen
        footer={
          <Button
            onPress={() => {
              setError(null);
              findResearcher();
            }}
          >
            Try again
          </Button>
        }
      >
        <Animated.View entering={FadeIn} style={styles.body}>
          <Mascot size={120} mood="calm" />
          <Text style={[type.title, styles.center]}>We couldn’t find your researcher</Text>
          <Text style={[type.body, styles.center]}>{error.message}</Text>
        </Animated.View>
      </Screen>
    );
  }

  if (noneAvailable) {
    return (
      <Screen
        footer={<Button onPress={() => router.replace(afterMatching())}>Go to my home</Button>}
      >
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
