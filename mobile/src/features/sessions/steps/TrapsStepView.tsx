import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import type { TrapsStep } from '@/features/sessions/content/types';
import { NOT_SURE, TRAPS } from '@/features/sessions/traps';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** Tag a thought with any traps it might be. "Not sure" is a fine answer too. */
export default function TrapsStepView({
  step,
  answer,
  onAnswer,
}: {
  step: TrapsStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  function toggle(id: string) {
    haptics.tick();
    if (id === NOT_SURE) return onAnswer(answer.includes(NOT_SURE) ? [] : [NOT_SURE]);
    const without = answer.filter((a) => a !== id && a !== NOT_SURE);
    onAnswer(answer.includes(id) ? without : [...without, id]);
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.eyebrow}>Thought record</Text>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.list}>
        {TRAPS.map((trap) => {
          const on = answer.includes(trap.id);
          return (
            <Pressable
              key={trap.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${trap.label}: ${trap.meaning}`}
              onPress={() => toggle(trap.id)}
              style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.8 }]}
            >
              <SessionPhoto photo={trap.picture} style={styles.picture} />
              <View style={styles.text}>
                <Text style={styles.label}>{trap.label}</Text>
                <Text style={styles.meaning}>{trap.meaning}</Text>
              </View>
              <View style={[styles.box, on && styles.boxOn]}>
                {on && <CheckIcon size={12} color={colors.onPrimary} />}
              </View>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: answer.includes(NOT_SURE) }}
          onPress={() => toggle(NOT_SURE)}
          style={[styles.notSure, answer.includes(NOT_SURE) && styles.rowOn]}
        >
          <Text style={styles.label}>Not sure</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    paddingRight: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  picture: { width: 64, height: 52, borderRadius: radius.md },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  meaning: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
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
  notSure: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
