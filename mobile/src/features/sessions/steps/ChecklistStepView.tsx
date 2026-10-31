import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import type { ChecklistStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** Index -1 stands for "None of these", which clears every other pick. */
export const NONE = -1;

export default function ChecklistStepView({
  step,
  picked,
  onPick,
}: {
  step: ChecklistStep;
  picked: number[];
  onPick: (picked: number[]) => void;
}) {
  const none = picked.includes(NONE);
  const options = [
    ...step.options.map((label, i) => ({ label, i })),
    { label: 'None of these', i: NONE },
  ];

  function toggle(i: number) {
    haptics.tick();
    if (i === NONE) return onPick(none ? [] : [NONE]);
    const without = picked.filter((p) => p !== i && p !== NONE);
    onPick(picked.includes(i) ? without : [...without, i]);
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.list}>
        {options.map(({ label, i }) => {
          const on = picked.includes(i);
          return (
            <Pressable
              key={i}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(i)}
              style={({ pressed }) => [
                styles.option,
                on && styles.optionOn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={[styles.box, on && styles.boxOn]}>
                {on && <CheckIcon size={12} color={colors.onPrimary} />}
              </View>
              <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {picked.length > 0 && (
        <Animated.View
          key={none ? 'none' : 'some'}
          entering={FadeIn.duration(300)}
          style={styles.reply}
        >
          <Text style={stepText.feedback}>{none ? step.responseNone : step.responseSome}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20, paddingTop: 8 },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  label: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  labelOn: { fontFamily: fonts.bold },
  reply: { padding: 16, borderRadius: radius.md, backgroundColor: colors.butter },
});
