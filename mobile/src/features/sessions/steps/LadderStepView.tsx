import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { LadderStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

function Down() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" accessibilityElementsHidden>
      <Path
        d="M9 2v13M4 10l5 5 5-5"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** A big task that shrinks one rung at a time until the first step is small enough to start. */
export default function LadderStepView({
  step,
  shown,
  onShow,
}: {
  step: LadderStep;
  shown: number;
  onShow: (count: number) => void;
}) {
  const done = shown >= step.rungs.length;
  const rungs = step.rungs.slice(0, shown);

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.body}</Text>
      </View>

      <View style={styles.ladder}>
        <View style={[styles.rung, styles.goal]}>
          <Text style={styles.goalText}>{step.goal}</Text>
        </View>
        {rungs.map((text, i) => {
          const last = done && i === rungs.length - 1;
          return (
            <Animated.View
              key={text}
              entering={FadeInUp.duration(320)}
              style={[styles.step, { width: `${92 - i * 8}%` }]}
            >
              <Down />
              <View style={[styles.rung, last && styles.first]}>
                {last && <Text style={styles.firstLabel}>First step</Text>}
                <Text style={[styles.rungText, last && styles.firstText]}>{text}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {done ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.reply}>
          <Text style={stepText.feedback}>{step.lesson}</Text>
        </Animated.View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.tap();
            onShow(shown + 1);
          }}
          style={({ pressed }) => [styles.smaller, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.smallerText}>
            {shown === 0 ? 'Make it smaller' : 'Smaller still'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  ladder: { alignItems: 'center', gap: 4 },
  step: { alignItems: 'center', gap: 4 },
  rung: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  goal: { width: '100%', backgroundColor: colors.lavender, borderColor: colors.lavender },
  goalText: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink, textAlign: 'center' },
  rungText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink, textAlign: 'center' },
  first: { borderColor: colors.primary, backgroundColor: colors.primarySoft, gap: 2 },
  firstLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
    textAlign: 'center',
  },
  firstText: { fontFamily: fonts.bold, color: colors.primary },
  smaller: {
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  smallerText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  reply: { padding: 16, borderRadius: radius.md, backgroundColor: colors.butter },
});
