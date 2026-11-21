import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { dayKey, shortDay, weekDays } from '@/features/activities/activities';
import { colors, fonts } from '@/theme';

/** Monday to Sunday with a tick on each day the practice was done. */
export default function PracticeWeek({
  done,
  today = new Date(),
}: {
  done: Set<string>;
  today?: Date;
}) {
  const days = weekDays(today);
  const count = days.filter((d) => done.has(dayKey(d))).length;
  return (
    <View style={styles.wrap}>
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`Done on ${count} of 7 days this week`}
      >
        {days.map((d) => {
          const key = dayKey(d);
          const on = done.has(key);
          const isToday = key === dayKey(today);
          const future = d > today && !isToday;
          return (
            <View key={key} style={styles.day}>
              <Text style={[styles.name, isToday && styles.today]}>{shortDay(d).charAt(0)}</Text>
              <View
                style={[
                  styles.dot,
                  on && styles.dotOn,
                  isToday && !on && styles.dotToday,
                  future && styles.dotFuture,
                ]}
              >
                {on && <CheckIcon size={11} color={colors.onPrimary} />}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.count}>{count} of 7 days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  row: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkFaint },
  today: { color: colors.primary },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  dotToday: { borderColor: colors.primary, borderStyle: 'dashed' },
  dotFuture: { opacity: 0.5 },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted, paddingBottom: 3 },
});
