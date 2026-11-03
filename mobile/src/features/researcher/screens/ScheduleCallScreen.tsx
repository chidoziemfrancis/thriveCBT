import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { CALL_MINUTES, bookableDays, dayLabel, slotsForDay } from '@/features/researcher/schedule';
import { addBooking, cancelCall } from '@/features/researcher/scheduleStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function time(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/**
 * Book a check-in with one of your own students, in the style of Spring Health's booking and
 * Calendly's time slots: pick a day, then a free slot. When `replace` is given, this moves that
 * call instead of adding a new one.
 */
export default function ScheduleCallScreen() {
  const params = useLocalSearchParams<{ studentId?: string; replace?: string }>();
  const { students, calls, now } = useResearcher();
  const moving = params.replace ? calls.find((c) => c.id === params.replace) : undefined;

  const [studentId, setStudentId] = useState(params.studentId ?? moving?.studentId);
  const [picking, setPicking] = useState(!studentId);
  const days = bookableDays(now);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState<Date | null>(null);
  const [weekly, setWeekly] = useState(!moving);
  const [note, setNote] = useState(moving?.note ?? '');

  const student = students.find((s) => s.id === studentId);
  const slots = day ? slotsForDay(day, calls, now, moving?.id) : [];
  const first = student?.name.split(' ')[0];

  function confirm() {
    if (!student || !slot) return;
    const booking = addBooking({
      studentId: student.id,
      startsAt: slot.toISOString(),
      durationMin: CALL_MINUTES,
      weekly,
      note: note.trim() || undefined,
    });
    if (moving) cancelCall(moving.id);
    haptics.success();
    router.replace({
      pathname: '/researcher/call/[callId]',
      params: { callId: `${booking.id}@${booking.startsAt}`, booked: '1' },
    });
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          {student && slot && (
            <Text style={styles.summary}>
              {dayLabel(slot, now)}, {time(slot)}
              {weekly ? ' · every week' : ''} · {first} will get a notification.
            </Text>
          )}
          <Button disabled={!student || !slot} onPress={confirm}>
            {moving ? 'Move call' : 'Schedule call'}
          </Button>
        </View>
      }
    >
      <BackButton />
      <Text style={[type.title, styles.title]}>
        {moving ? 'Move this call' : 'Schedule a call'}
      </Text>

      <Text style={styles.label}>Student</Text>
      {student && !picking ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Student: ${student.name}. Change`}
          disabled={Boolean(moving)}
          onPress={() => setPicking(true)}
          style={styles.studentRow}
        >
          <StudentAvatar id={student.id} name={student.name} size={36} />
          <Text style={styles.studentName}>{student.name}</Text>
          {!moving && <Text style={styles.change}>Change</Text>}
        </Pressable>
      ) : (
        <View>
          {students.map((s, i) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => {
                haptics.tick();
                setStudentId(s.id);
                setPicking(false);
              }}
              style={[styles.studentRow, i > 0 && styles.divider]}
            >
              <StudentAvatar id={s.id} name={s.name} size={36} />
              <Text style={styles.studentName}>{s.name}</Text>
              <ChevronRightIcon size={16} color={colors.inkFaint} />
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>Day</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.days}
      >
        {days.map((d) => {
          const on = d.getTime() === day?.getTime();
          return (
            <Pressable
              key={d.getTime()}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={d.toLocaleDateString(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              onPress={() => {
                haptics.tick();
                setDay(d);
                setSlot(null);
              }}
              style={[styles.day, on && styles.dayOn]}
            >
              <Text style={[styles.dayName, on && styles.onText]}>
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNumber, on && styles.onText]}>{d.getDate()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Time</Text>
      {slots.length === 0 ? (
        <Text style={styles.empty}>No times left on this day.</Text>
      ) : (
        <View style={styles.slots}>
          {slots.map((s) => {
            const on = slot?.getTime() === s.start.getTime();
            return (
              <Pressable
                key={s.start.getTime()}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: s.taken }}
                accessibilityLabel={`${time(s.start)}${s.taken ? ', already booked' : ''}`}
                disabled={s.taken}
                onPress={() => {
                  haptics.tick();
                  setSlot(s.start);
                }}
                style={[styles.slot, on && styles.slotOn, s.taken && styles.slotTaken]}
              >
                <Text
                  style={[styles.slotText, on && styles.onText, s.taken && styles.slotTakenText]}
                >
                  {time(s.start)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {!moving && (
        <View style={styles.repeat}>
          <View style={styles.repeatText}>
            <Text style={styles.repeatTitle}>Repeat every week</Text>
            <Text style={styles.repeatHint}>For the weekly check-in, at the same time</Text>
          </View>
          <Switch
            accessibilityLabel="Repeat every week"
            value={weekly}
            onValueChange={(on) => {
              haptics.tick();
              setWeekly(on);
            }}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      )}

      <Text style={styles.label}>Note for {first ?? 'the student'} (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Let's talk about this week's session"
        placeholderTextColor={colors.inkFaint}
        maxLength={200}
        style={styles.note}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 16 },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  studentName: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  change: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  dayScroll: { marginHorizontal: -24 },
  days: { gap: 8, paddingHorizontal: 24 },
  day: {
    width: 56,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayName: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  dayNumber: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  onText: { color: colors.onPrimary },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31.5%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotTaken: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
  slotText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  slotTakenText: { color: colors.inkFaint, textDecorationLine: 'line-through' },
  empty: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  repeat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  repeatText: { flex: 1, gap: 2 },
  repeatTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  repeatHint: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  note: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  footer: { gap: 8 },
  summary: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
