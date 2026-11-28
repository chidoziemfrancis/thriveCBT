import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import { NOT_IN_BODY, STRESS_SPOTS } from '@/features/coping/utils/coping';
import BodyFigure, { FIGURE } from '@/features/sessions/art/BodyFigure';
import type { BodyMapStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const SPOT = 30;

/** Tap where stress shows up, on the figure or in the list under it. */
export default function BodyMapStepView({
  step,
  answer,
  onAnswer,
}: {
  step: BodyMapStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  function toggle(id: string) {
    haptics.tick();
    if (id === NOT_IN_BODY) return onAnswer(answer.includes(id) ? [] : [id]);
    const rest = answer.filter((a) => a !== id && a !== NOT_IN_BODY);
    onAnswer(answer.includes(id) ? rest : [...rest, id]);
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.body}</Text>
      </View>

      <View style={styles.stage}>
        <BodyFigure color={colors.primary} fill={colors.primarySoft} />
        {STRESS_SPOTS.map((spot) => {
          const on = answer.includes(spot.id);
          return (
            <Pressable
              key={spot.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={spot.label}
              hitSlop={8}
              onPress={() => toggle(spot.id)}
              style={[
                styles.spot,
                on && styles.spotOn,
                { left: spot.x * FIGURE.width - SPOT / 2, top: spot.y * FIGURE.height - SPOT / 2 },
              ]}
            >
              {on && <CheckIcon size={12} color={colors.onPrimary} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chips}>
        {[...STRESS_SPOTS, { id: NOT_IN_BODY, label: 'Not sure yet' }].map((spot) => {
          const on = answer.includes(spot.id);
          return (
            <Pressable
              key={spot.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(spot.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{spot.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {answer.length > 0 && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.reply}>
          <Text style={stepText.feedback}>
            {answer.includes(NOT_IN_BODY)
              ? 'That’s fine. Next time you feel stressed, check in with your body and notice.'
              : step.response}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20, paddingTop: 8 },
  stage: { alignSelf: 'center', width: FIGURE.width, height: FIGURE.height },
  spot: {
    position: 'absolute',
    width: SPOT,
    height: SPOT,
    borderRadius: SPOT / 2,
    borderWidth: 2,
    borderColor: colors.peachInk,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotOn: { backgroundColor: colors.peachInk },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.peachInk, backgroundColor: colors.peach },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  chipTextOn: { fontFamily: fonts.bold },
  reply: { padding: 16, borderRadius: radius.md, backgroundColor: colors.butter },
});
