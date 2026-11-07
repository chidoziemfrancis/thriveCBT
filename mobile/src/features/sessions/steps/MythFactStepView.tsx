import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Cloud from '@/features/sessions/art/Cloud';
import type { MythFactStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const SPRING = { damping: 16, stiffness: 160 };

/** The student swipes the card to call it, then sees why: deciding first makes it stick. */
export default function MythFactStepView({
  step,
  answer,
  onAnswer,
}: {
  step: MythFactStep;
  answer: boolean | undefined;
  onAnswer: (saysFact: boolean) => void;
}) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.22;
  const answered = answer !== undefined;
  const right = answered && answer === step.isFact;
  const x = useSharedValue(0);

  function choose(saysFact: boolean) {
    if (answered) return;
    if (saysFact === step.isFact) haptics.success();
    else haptics.tap();
    onAnswer(saysFact);
  }

  const pan = usePanGesture({
    enabled: !answered,
    onUpdate: (event) => {
      'worklet';
      x.set(event.translationX);
    },
    onFinalize: () => {
      'worklet';
      const moved = x.get();
      if (Math.abs(moved) > threshold) scheduleOnRN(choose, moved > 0);
      x.set(withSpring(0, SPRING));
    },
  });

  const card = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { rotate: `${interpolate(x.value, [-width, width], [-14, 14])}deg` },
    ],
  }));
  const mythHint = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-threshold, 0], [1, 0.35], 'clamp'),
  }));
  const factHint = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, threshold], [0.35, 1], 'clamp'),
  }));

  return (
    <View style={styles.wrap}>
      <Text style={[stepText.eyebrow, stepText.centered]}>Myth or fact?</Text>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, answered && (right ? styles.cardRight : styles.cardWrong), card]}
          accessibilityHint={answered ? undefined : 'Swipe left for myth, right for fact'}
        >
          <Cloud size={70} color={answered && right ? colors.primary : colors.lavenderInk} />
          <Text style={styles.statement}>“{step.statement}”</Text>
        </Animated.View>
      </GestureDetector>

      {!answered ? (
        <View style={styles.buttons}>
          <Animated.View style={[styles.side, mythHint]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Myth"
              onPress={() => choose(false)}
              style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.buttonText}>← Myth</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={[styles.side, factHint]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fact"
              onPress={() => choose(true)}
              style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.buttonText}>Fact →</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(320)} style={styles.reveal}>
          <Animated.Text
            entering={ZoomIn.springify()}
            style={[styles.verdict, !right && { color: colors.ink }]}
          >
            {right ? 'You got it' : `Not quite, it’s a ${step.isFact ? 'fact' : 'myth'}`}
          </Animated.Text>
          <Text style={stepText.feedback}>{step.explanation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 16 },
  card: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.lavender,
  },
  cardRight: { backgroundColor: colors.primarySoft },
  cardWrong: { backgroundColor: colors.butter },
  statement: {
    fontFamily: fonts.heavy,
    fontSize: 22,
    lineHeight: 30,
    color: colors.ink,
    textAlign: 'center',
  },
  buttons: { flexDirection: 'row', gap: 12 },
  side: { flex: 1 },
  button: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  reveal: { gap: 8 },
  verdict: { fontFamily: fonts.heavy, fontSize: 18, color: colors.primary },
});
