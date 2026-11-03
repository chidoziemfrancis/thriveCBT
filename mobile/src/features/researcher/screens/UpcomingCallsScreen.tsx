import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon, PlusIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { dayLabel, upcomingByDay } from '@/features/researcher/schedule';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Every booked call for the next two weeks, grouped by day like a calendar's schedule view. */
export default function UpcomingCallsScreen() {
  const { students, calls, now } = useResearcher();
  const days = upcomingByDay(calls, now);

  return (
    <Screen>
      <View style={styles.top}>
        <BackButton />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.tap();
            router.push('/researcher/schedule');
          }}
          style={({ pressed }) => [styles.add, pressed && { opacity: 0.85 }]}
        >
          <PlusIcon size={14} color={colors.onPrimary} />
          <Text style={styles.addText}>Schedule</Text>
        </Pressable>
      </View>
      <Text style={[type.title, styles.title]}>Upcoming calls</Text>

      {days.length === 0 ? (
        <Text style={styles.empty}>No calls booked for the next two weeks.</Text>
      ) : (
        days.map((group) => (
          <View key={group.date.getTime()} style={styles.group}>
            <Text style={styles.groupTitle}>{dayLabel(group.date, now)}</Text>
            {group.calls.map((call, i) => {
              const student = students.find((s) => s.id === call.studentId);
              if (!student) return null;
              return (
                <Pressable
                  key={call.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${time(call.startsAt)}, ${student.name}`}
                  onPress={() => {
                    haptics.tick();
                    router.push({
                      pathname: '/researcher/call/[callId]',
                      params: { callId: call.id },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    i > 0 && styles.divider,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.time}>{time(call.startsAt)}</Text>
                  <StudentAvatar id={student.id} name={student.name} size={34} />
                  <View style={styles.text}>
                    <Text style={styles.name}>{student.name}</Text>
                    <Text style={styles.meta}>
                      {call.durationMin} min{call.weekly ? ' · weekly' : ''}
                    </Text>
                  </View>
                  <ChevronRightIcon size={16} color={colors.inkFaint} />
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
  title: { marginTop: 16 },
  empty: { marginTop: 24, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  group: { marginTop: 24 },
  groupTitle: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  time: { width: 64, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  text: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
