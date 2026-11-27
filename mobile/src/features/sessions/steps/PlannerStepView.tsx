import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  type PlanItem,
  SLOTS,
  dayKey,
  dayName,
  nextSevenDays,
  readPlan,
  writePlan,
} from '@/features/activities/utils/activities';
import PlanForm from '@/features/activities/components/PlanForm';
import PlanRow from '@/features/activities/components/PlanRow';
import WeekStrip, { type DayMark } from '@/features/activities/components/WeekStrip';
import type { PlannerStep } from '@/features/sessions/content/types';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

/** The week ahead: pick a day, add an activity at a time of day, aim for the goal. */
export default function PlannerStepView({
  step,
  suggestions,
  answer,
  onAnswer,
}: {
  step: PlannerStep;
  suggestions: string[];
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const [today] = useState(() => new Date());
  const days = nextSevenDays(today);
  const [selected, setSelected] = useState(dayKey(today));
  const plan = readPlan(answer);
  const selectedDate = days.find((d) => dayKey(d) === selected) ?? today;
  const marks: Record<string, DayMark> = {};
  plan.forEach((p) => (marks[p.date] = 'planned'));
  const onDay = plan.filter((p) => p.date === selected);

  function remove(item: PlanItem) {
    onAnswer(writePlan(plan.filter((p) => p !== item)));
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.goal} accessibilityLabel={`${plan.length} of ${step.goal} planned`}>
        {Array.from({ length: step.goal }, (_, i) => (
          <View key={i} style={[styles.pip, i < plan.length && styles.pipOn]} />
        ))}
        <Text style={styles.goalText}>
          {plan.length >= step.goal
            ? `${plan.length} planned. That’s your week set.`
            : `${plan.length} of ${step.goal} planned`}
        </Text>
      </View>

      <WeekStrip
        days={days}
        selected={selected}
        marks={marks}
        onSelect={setSelected}
        today={today}
      />

      <View style={styles.day}>
        <Text style={styles.dayTitle}>{dayName(selectedDate, today)}</Text>
        {onDay.length === 0 ? (
          <Text style={styles.empty}>Nothing planned yet.</Text>
        ) : (
          SLOTS.map((slot) => {
            const items = onDay.filter((p) => p.slot === slot.id);
            if (items.length === 0) return null;
            return (
              <View key={slot.id} style={styles.slot}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                {items.map((item) => (
                  <PlanRow
                    key={`${item.slot}-${item.label}`}
                    label={item.label}
                    meta={
                      item.predicted !== undefined
                        ? `You guess ${item.predicted}/10 enjoyment`
                        : undefined
                    }
                    onRemove={() => remove(item)}
                  />
                ))}
              </View>
            );
          })
        )}
      </View>

      <PlanForm
        suggestions={suggestions}
        day={dayName(selectedDate, today)}
        onAdd={({ label, slot, predicted }) => {
          const exists = plan.some(
            (p) => p.date === selected && p.slot === slot && p.label === label
          );
          if (!exists) onAnswer(writePlan([...plan, { date: selected, slot, label, predicted }]));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pip: { width: 22, height: 6, borderRadius: radius.pill, backgroundColor: colors.border },
  pipOn: { backgroundColor: colors.primary },
  goalText: { marginLeft: 4, fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  day: { gap: 10 },
  dayTitle: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  empty: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkFaint },
  slot: { gap: 6 },
  slotLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
});
