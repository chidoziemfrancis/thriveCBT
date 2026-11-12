import { useState } from 'react';
import { type LayoutRectangle, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CheckIcon } from '@/components/icons';
import BalanceScale from '@/features/sessions/art/BalanceScale';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import type { SortStep } from '@/features/sessions/content/types';
import { MISS, sortProgress } from '@/features/sessions/sessionLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

type Target = { id: string; label: string; hint: string };

const CBT_TARGETS: Target[] = [
  {
    id: 'thought',
    label: 'Thought',
    hint: 'That’s something going through their mind, so it’s a Thought.',
  },
  { id: 'feeling', label: 'Feeling', hint: 'That’s how they feel inside, so it’s a Feeling.' },
  { id: 'do', label: 'Do', hint: 'That’s something they did, so it goes under Do.' },
];

// Three targets sit as a triangle; four sit in the corners.
const PLACES: Record<number, object[]> = {
  2: [
    { bottom: 0, left: 0 },
    { bottom: 0, right: 0 },
  ],
  3: [
    { top: 0, alignSelf: 'center' },
    { bottom: 0, right: 0 },
    { bottom: 0, left: 0 },
  ],
  4: [
    { top: 0, left: 0 },
    { top: 0, right: 0 },
    { bottom: 0, left: 0 },
    { bottom: 0, right: 0 },
  ],
};

type Frames = Record<string, LayoutRectangle | undefined>;

function inside(frame: LayoutRectangle | undefined, x: number, y: number) {
  return Boolean(
    frame &&
    x >= frame.x &&
    x <= frame.x + frame.width &&
    y >= frame.y &&
    y <= frame.y + frame.height
  );
}

export default function SortStepView({
  step,
  answer,
  onAnswer,
}: {
  step: SortStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const { scenario, placed, next, firstTry, done } = sortProgress(step, answer);
  const targets = step.targets ?? CBT_TARGETS;
  const [frames, setFrames] = useState<Frames>({});
  const [hint, setHint] = useState<string | null>(null);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const shake = useSharedValue(0);

  function measure(key: string) {
    return (e: { nativeEvent: { layout: LayoutRectangle } }) => {
      const layout = e.nativeEvent.layout;
      setFrames((f) => ({ ...f, [key]: layout }));
    };
  }

  function place(part: string) {
    if (!next) return;
    if (part === next.part) {
      haptics.success();
      setHint(null);
      onAnswer([...answer, next.id]);
    } else {
      haptics.error();
      setHint(targets.find((t) => t.id === next.part)?.hint ?? null);
      shake.set(
        withSequence(
          withTiming(-10, { duration: 60 }),
          withTiming(10, { duration: 60 }),
          withTiming(0, { duration: 60 })
        )
      );
      const miss = `${MISS}${next.id}`;
      if (!answer.includes(miss)) onAnswer([...answer, miss]);
    }
  }

  function drop(dx: number, dy: number) {
    const card = frames.card;
    if (!card) return;
    const cx = card.x + card.width / 2 + dx;
    const cy = card.y + card.height / 2 + dy;
    const hit = targets.find((t) => inside(frames[t.id], cx, cy));
    if (hit) place(hit.id);
  }

  const pan = usePanGesture({
    onUpdate: (event) => {
      'worklet';
      x.set(event.translationX);
      y.set(event.translationY);
    },
    onFinalize: () => {
      'worklet';
      scheduleOnRN(drop, x.get(), y.get());
      x.set(withSpring(0, { damping: 16 }));
      y.set(withSpring(0, { damping: 16 }));
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value + shake.value }, { translateY: y.value }],
  }));

  if (!scenario) {
    return (
      <View style={styles.wrap}>
        <View style={stepText.block}>
          <Text style={stepText.title}>{step.title}</Text>
          <Text style={stepText.body}>{step.body}</Text>
        </View>
        <View style={styles.stories}>
          {step.scenarios.map((s, i) => (
            <Animated.View key={s.id} entering={FadeInDown.delay(60 * i).duration(300)}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  haptics.tick();
                  onAnswer([s.id]);
                }}
                style={({ pressed }) => [styles.story, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                {s.picture && <SessionPhoto photo={s.picture} style={styles.storyPicture} />}
                <Text style={styles.storyLabel}>{s.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.wrap}>
        <View style={stepText.block}>
          <Text style={stepText.title}>
            {step.scenarios.length > 1 ? `${scenario.label}, sorted` : 'All sorted'}
          </Text>
          <Text style={stepText.body}>
            {firstTry === scenario.cards.length
              ? 'Every one right first time.'
              : `${firstTry} of ${scenario.cards.length} right first time. Spotting them gets easier with practice.`}
          </Text>
        </View>
        {targets.map((target) => (
          <Animated.View key={target.id} entering={FadeIn.duration(300)} style={styles.group}>
            <Text style={styles.groupLabel}>{target.label}</Text>
            {scenario.cards
              .filter((c) => c.part === target.id)
              .map((c) => (
                <View key={c.id} style={styles.groupRow}>
                  <CheckIcon size={12} color={colors.primary} />
                  <Text style={styles.groupText}>{c.text}</Text>
                </View>
              ))}
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>
          {step.scenarios.length > 1 ? `${scenario.label} · ` : ''}
          {placed.length + 1} of {scenario.cards.length}
        </Text>
        <Text style={stepText.title}>{step.prompt ?? 'Thought, feeling or do?'}</Text>
        <Text style={stepText.body}>Drag the card to where it belongs, or tap a box.</Text>
      </View>

      {step.scale && (
        <BalanceScale
          left={placed.filter((c) => c.part === targets[0].id).length}
          right={placed.filter((c) => c.part === targets[1].id).length}
          leftLabel={targets[0].label}
          rightLabel={targets[1].label}
        />
      )}

      <View style={[styles.board, step.scale && styles.boardShort]}>
        {targets.map((target, i) => (
          <Pressable
            key={target.id}
            accessibilityRole="button"
            accessibilityLabel={`Put in ${target.label}`}
            onLayout={measure(target.id)}
            onPress={() => place(target.id)}
            style={[
              styles.target,
              targets.length !== 3 && styles.targetWide,
              PLACES[targets.length]?.[i],
            ]}
          >
            <Text style={styles.targetText}>{target.label}</Text>
          </Pressable>
        ))}

        {next && (
          <GestureDetector gesture={pan}>
            <Animated.View
              key={next.id}
              entering={FadeIn.duration(250)}
              onLayout={measure('card')}
              style={[styles.card, targets.length === 2 && styles.cardHigh, cardStyle]}
              accessible
              accessibilityLabel={next.text}
            >
              <Text style={styles.cardText}>“{next.text}”</Text>
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      {hint && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={styles.hint}
          accessibilityLiveRegion="polite"
        >
          {hint}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  stories: { gap: 12 },
  story: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  storyPicture: { width: 110, height: 84, borderRadius: radius.md },
  storyLabel: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  board: { height: 330 },
  boardShort: { height: 250 },
  cardHigh: { top: 10 },
  target: {
    position: 'absolute',
    width: 130,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  targetWide: { width: '48%' },
  targetText: {
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: fonts.heavy,
    fontSize: 15,
    color: colors.primary,
  },
  card: {
    position: 'absolute',
    top: 106,
    left: 24,
    right: 24,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  cardText: {
    fontFamily: fonts.heavy,
    fontSize: 18,
    lineHeight: 25,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  group: { gap: 6 },
  groupLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
});
