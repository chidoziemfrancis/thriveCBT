import { StyleSheet, Text, View } from 'react-native';

import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import type { WeekDay } from '@/features/progress/progressLogic';
import { colors, fonts } from '@/theme';

const FACE = 34;

function dayName(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <View style={styles.card}>
      {days.map((day) => {
        const label = `${dayName(day.date)} ${day.date.getDate()}: ${
          day.mood === null ? (day.isFuture ? 'not yet' : 'no mood logged') : MOODS[day.mood].label
        }`;
        return (
          <View
            key={day.date.getTime()}
            style={[styles.day, day.isFuture && { opacity: 0.4 }]}
            accessible
            accessibilityLabel={label}
          >
            <Text style={[styles.name, day.isToday && styles.today]}>{dayName(day.date)}</Text>
            <Text style={[styles.date, day.isToday && styles.today]}>{day.date.getDate()}</Text>
            {day.mood !== null ? (
              <MoodFace mood={day.mood} size={FACE} />
            ) : (
              <View style={[styles.empty, day.isToday && styles.emptyToday]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  date: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  today: { color: colors.primary },
  empty: {
    width: FACE,
    height: FACE,
    borderRadius: FACE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  emptyToday: { borderColor: colors.primary, borderStyle: 'solid' },
});
