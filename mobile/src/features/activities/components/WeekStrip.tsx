import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { dayKey, shortDay } from '@/features/activities/utils/activities';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

export type DayMark = 'planned' | 'done';

/** Seven days in a row: a dot under days with plans, a tick once everything on them is done. */
export default function WeekStrip({
  days,
  selected,
  marks,
  onSelect,
  today = new Date(),
}: {
  days: Date[];
  selected: string;
  marks: Record<string, DayMark>;
  onSelect: (key: string) => void;
  today?: Date;
}) {
  return (
    <View style={styles.row}>
      {days.map((date) => {
        const key = dayKey(date);
        const on = key === selected;
        const mark = marks[key];
        const isToday = key === dayKey(today);
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${mark === 'done' ? ', all done' : mark ? ', has plans' : ''}`}
            onPress={() => {
              haptics.tick();
              onSelect(key);
            }}
            style={({ pressed }) => [styles.day, on && styles.dayOn, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.name, on && styles.textOn, isToday && !on && styles.today]}>
              {shortDay(date)}
            </Text>
            <Text style={[styles.date, on && styles.textOn]}>{date.getDate()}</Text>
            <View style={styles.markSlot}>
              {mark === 'done' ? (
                <View style={[styles.tick, on && styles.tickOn]}>
                  <CheckIcon size={9} color={on ? colors.primary : colors.onPrimary} />
                </View>
              ) : mark === 'planned' ? (
                <View style={[styles.dot, on && styles.dotOn]} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: radius.md,
  },
  dayOn: { backgroundColor: colors.primary },
  name: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  today: { color: colors.primary, fontFamily: fonts.bold },
  date: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  textOn: { color: colors.onPrimary },
  markSlot: { height: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  dotOn: { backgroundColor: colors.onPrimary },
  tick: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: { backgroundColor: colors.onPrimary },
});
