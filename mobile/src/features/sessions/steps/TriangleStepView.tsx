import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { RefreshIcon } from '@/components/icons';
import type { CbtPart, TriangleStep } from '@/features/sessions/content/types';
import { FLIPPED } from '@/features/sessions/sessionLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const ORDER: CbtPart[] = ['thought', 'feeling', 'do'];
const LABELS: Record<CbtPart, string> = { thought: 'Thought', feeling: 'Feeling', do: 'Do' };
const STAGE = { width: 330, height: 330 };

function StrengthBar({ value }: { value: number }) {
  const width = useSharedValue(value);
  useEffect(() => {
    width.set(withTiming(value, { duration: 700 }));
  }, [value, width]);
  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

function Corner({
  part,
  style,
  open,
  next,
  text,
  strength,
  version,
  onPress,
}: {
  part: CbtPart;
  style: object;
  open: boolean;
  next: boolean;
  text: string;
  strength?: number;
  version: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={open ? `${LABELS[part]}: ${text}` : `${LABELS[part]}, tap to open`}
      onPress={onPress}
      style={[styles.corner, style, open && styles.cornerOpen, next && styles.cornerNext]}
    >
      <Text style={[styles.cornerLabel, open && { color: colors.primary }]}>{LABELS[part]}</Text>
      {open ? (
        <Animated.View key={version} entering={FadeIn.duration(300)} style={styles.cornerBody}>
          <Text style={styles.cornerText}>{text}</Text>
          {strength !== undefined && (
            <>
              <StrengthBar value={strength} />
              <Text style={styles.strength}>{strength}%</Text>
            </>
          )}
        </Animated.View>
      ) : (
        <Text style={styles.tap}>{next ? 'Tap me' : '…'}</Text>
      )}
    </Pressable>
  );
}

/** Tap each corner to follow one moment round the loop, then try a kinder thought and watch it change. */
export default function TriangleStepView({
  step,
  answer,
  onAnswer,
}: {
  step: TriangleStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const flipped = answer.includes(FLIPPED);
  const side = flipped ? step.after : step.before;
  const opened = ORDER.filter((p) => answer.includes(p));
  const allOpen = opened.length === ORDER.length;

  function open(part: CbtPart) {
    if (answer.includes(part)) return;
    // Corners open in order, so the student follows the loop rather than jumping around.
    if (ORDER[opened.length] !== part) {
      haptics.tap();
      return;
    }
    haptics.tick();
    onAnswer([...answer, part]);
  }

  function flip() {
    haptics.success();
    onAnswer([...answer.filter((a) => a !== FLIPPED), ...(flipped ? [] : [FLIPPED])]);
  }

  const text: Record<CbtPart, string> = {
    thought: `“${side.thought}”`,
    feeling: side.feeling,
    do: side.action,
  };

  const lit = (to: CbtPart) => answer.includes(to);

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.body}</Text>
      </View>

      <View style={styles.stage}>
        <Svg width={STAGE.width} height={STAGE.height} style={StyleSheet.absoluteFill}>
          <Path
            d="M200 92 L282 196"
            stroke={lit('feeling') ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M270 214 L278 200 L262 198"
            stroke={lit('feeling') ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M232 282 L102 282"
            stroke={lit('do') ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M112 272 L100 282 L112 292"
            stroke={lit('do') ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M48 196 L130 92"
            stroke={allOpen ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Path
            d="M118 96 L132 90 L134 104"
            stroke={allOpen ? colors.primary : colors.border}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
        <Text style={styles.name}>{step.name}</Text>
        {(['thought', 'feeling', 'do'] as const).map((part) => (
          <Corner
            key={part}
            part={part}
            style={CORNER_PLACE[part]}
            open={answer.includes(part)}
            next={ORDER[opened.length] === part}
            text={text[part]}
            strength={part === 'feeling' ? side.strength : undefined}
            version={flipped ? 'after' : 'before'}
            onPress={() => open(part)}
          />
        ))}
      </View>

      {allOpen && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.after}>
          <Text style={stepText.feedback}>
            {flipped
              ? `Same moment, different thought, and the feeling and what ${step.name} does change with it.`
              : 'Each corner feeds the next, and round it goes. Now change just the thought.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={flip}
            style={({ pressed }) => [
              styles.flip,
              flipped && styles.flipDone,
              pressed && { opacity: 0.8 },
            ]}
          >
            <RefreshIcon size={15} color={flipped ? colors.primary : colors.onPrimary} />
            <Text style={[styles.flipText, flipped && { color: colors.primary }]}>
              {flipped ? 'See the first thought again' : 'Try a different thought'}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const CORNER = 148;

const CORNER_PLACE: Record<CbtPart, object> = {
  thought: { top: 0, left: (STAGE.width - CORNER) / 2 },
  feeling: { bottom: 0, right: 0 },
  do: { bottom: 0, left: 0 },
};

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  stage: { alignSelf: 'center', width: STAGE.width, height: STAGE.height },
  name: {
    position: 'absolute',
    top: 186,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkFaint,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    minHeight: 92,
    gap: 4,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cornerOpen: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cornerNext: { borderColor: colors.primary, borderStyle: 'dashed' },
  cornerLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  cornerBody: { gap: 6 },
  cornerText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, color: colors.ink },
  tap: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: '#E8836B' },
  strength: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  after: { gap: 12 },
  flip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  flipDone: { backgroundColor: colors.primarySoft },
  flipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
});
