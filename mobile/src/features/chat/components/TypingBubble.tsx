import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';

function Dot({ delay }: { delay: number }) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(withTiming(-4, { duration: 280 }), withTiming(0, { duration: 280 })),
          -1
        )
      )
    );
  }, [delay, lift]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

export default function TypingBubble({ name }: { name: string }) {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.bubble}
      accessibilityLabel={`${name} is typing`}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.inkFaint },
});
