import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { WELL_SECTIONS, type WellPlan } from '@/features/wellbeing/wellbeing';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

function day(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/** The note for a hard day, the four lists, and the goal with its steps. */
export default function WellPlanView({
  plan,
  onToggleStep,
}: {
  plan: WellPlan;
  /** When given, goal steps can be ticked off. */
  onToggleStep?: (index: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      {plan.note && (
        <View style={styles.note}>
          <Text style={styles.noteLabel}>A note from you, for a hard day</Text>
          <Text style={styles.noteText}>{plan.note}</Text>
        </View>
      )}

      <View>
        {WELL_SECTIONS.map((section, i) => {
          const items = plan[section.id] ?? [];
          return (
            <View key={section.id} style={[styles.section, i > 0 && styles.divider]}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.title}>{section.title}</Text>
                {items.length === 0 ? (
                  <Text style={styles.empty}>Nothing added yet</Text>
                ) : (
                  items.map((item) => (
                    <Text key={item} style={styles.item}>
                      {item}
                    </Text>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </View>

      {plan.goal && (
        <View style={styles.goal}>
          <Text style={styles.goalLabel}>My goal · {plan.goal.area}</Text>
          <Text style={styles.goalText}>{plan.goal.goal}</Text>
          {plan.goal.steps.map((step, i) => {
            const done = plan.goal?.done?.includes(i) ?? false;
            return (
              <Pressable
                key={step}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                disabled={!onToggleStep}
                onPress={() => {
                  haptics.tick();
                  onToggleStep?.(i);
                }}
                style={styles.step}
              >
                <View style={[styles.box, done && styles.boxOn]}>
                  {done && <CheckIcon size={11} color={colors.onPrimary} />}
                </View>
                <Text style={[styles.stepText, done && styles.stepDone]}>{step}</Text>
              </Pressable>
            );
          })}
          <Text style={styles.date}>First step: {day(plan.goal.date)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  note: { gap: 6, padding: 16, borderRadius: radius.lg, backgroundColor: colors.butter },
  noteLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.butterInk },
  noteText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.ink },
  section: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  number: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.primary },
  body: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  item: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  empty: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  goal: {
    gap: 8,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  goalLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  goalText: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 23, color: colors.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  stepDone: { color: colors.inkFaint, textDecorationLine: 'line-through' },
  date: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
});
