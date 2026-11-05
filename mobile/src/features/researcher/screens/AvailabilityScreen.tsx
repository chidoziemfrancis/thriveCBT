import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { CALL_MINUTES, timeLabel } from '@/features/researcher/schedule';
import { setDayHours } from '@/features/researcher/settingsStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const WEEK = [1, 2, 3, 4, 5, 6, 0];
const EARLIEST = 7 * 60;
const LATEST = 21 * 60;
const TIMES = Array.from(
  { length: (LATEST - EARLIEST) / CALL_MINUTES + 1 },
  (_, i) => EARLIEST + i * CALL_MINUTES
);

function dayName(day: number) {
  // 2 Jan 2000 was a Sunday.
  return new Date(2000, 0, 2 + day).toLocaleDateString(undefined, { weekday: 'long' });
}

type Editing = { day: number; edge: 'start' | 'end' } | null;

export default function AvailabilityScreen() {
  const { settings } = useResearcher();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.title]}>Availability</Text>
      <Text style={type.body}>When students can be booked for calls.</Text>

      <View style={styles.list}>
        {WEEK.map((day, i) => {
          const hours = settings.hours[day];
          const open = editing?.day === day;
          // Leave room for at least one call.
          const choices =
            editing && open
              ? TIMES.filter((t) =>
                  editing.edge === 'start'
                    ? t + CALL_MINUTES <= hours.end
                    : t >= hours.start + CALL_MINUTES
                )
              : [];
          return (
            <View key={day} style={[styles.day, i > 0 && styles.divider]}>
              <View style={styles.dayRow}>
                <Text style={[styles.dayName, !hours.on && { color: colors.inkFaint }]}>
                  {dayName(day)}
                </Text>
                <Switch
                  accessibilityLabel={`Available on ${dayName(day)}`}
                  value={hours.on}
                  onValueChange={(on) => {
                    haptics.tick();
                    setDayHours(day, { on });
                    if (!on && open) setEditing(null);
                  }}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>

              {hours.on ? (
                <View style={styles.range}>
                  {(['start', 'end'] as const).map((edge, j) => (
                    <View key={edge} style={styles.rangePart}>
                      {j === 1 && <Text style={styles.dash}>–</Text>}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${edge === 'start' ? 'From' : 'Until'} ${timeLabel(hours[edge])}`}
                        accessibilityState={{ expanded: open && editing?.edge === edge }}
                        onPress={() => {
                          haptics.tick();
                          setEditing(open && editing?.edge === edge ? null : { day, edge });
                        }}
                        style={[styles.time, open && editing?.edge === edge && styles.timeOn]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            open && editing?.edge === edge && styles.timeTextOn,
                          ]}
                        >
                          {timeLabel(hours[edge])}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.off}>Unavailable</Text>
              )}

              {open && choices.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.choicesScroll}
                  contentContainerStyle={styles.choices}
                >
                  {choices.map((t) => {
                    const on = hours[editing!.edge] === t;
                    return (
                      <Pressable
                        key={t}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        onPress={() => {
                          haptics.tick();
                          setDayHours(day, { [editing!.edge]: t });
                          setEditing(null);
                        }}
                        style={[styles.choice, on && styles.choiceOn]}
                      >
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>
                          {timeLabel(t)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 16, marginBottom: 6 },
  list: { marginTop: 16 },
  day: { gap: 8, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayName: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  range: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangePart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dash: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkFaint },
  time: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  timeText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  timeTextOn: { color: colors.mintInk },
  off: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkFaint },
  choicesScroll: { marginHorizontal: -24 },
  choices: { gap: 8, paddingHorizontal: 24 },
  choice: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  choiceOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  choiceTextOn: { color: colors.onPrimary },
});
