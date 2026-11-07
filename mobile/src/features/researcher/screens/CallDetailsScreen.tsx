import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CameraIcon, CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { JOIN_EARLY_MIN } from '@/features/checkin/checkinLogic';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { dayLabel } from '@/features/researcher/schedule';
import { cancelCall } from '@/features/researcher/scheduleStore';
import { callState } from '@/features/researcher/todayLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/**
 * One booked call, after Spring Health's appointment details: who and when, then Join,
 * Reschedule and Cancel. Cancelling offers to book another time straight away.
 */
export default function CallDetailsScreen() {
  const { callId, booked } = useLocalSearchParams<{ callId: string; booked?: string }>();
  const { students, calls, now } = useResearcher();
  // Kept once found, so the screen can still say what was cancelled after the call is gone.
  const [call] = useState(() => calls.find((c) => c.id === callId));
  const [cancelled, setCancelled] = useState(false);
  const student = call && students.find((s) => s.id === call.studentId);

  if (!call || !student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This call couldn’t be found.</Text>
      </Screen>
    );
  }

  const first = student.name.split(' ')[0];
  const live = callState(call, now) === 'live';
  const date = new Date(call.startsAt);

  function confirmCancel() {
    Alert.alert(`Cancel this call with ${first}?`, `${first} will get a notification.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel call',
        style: 'destructive',
        onPress: () => {
          cancelCall(call!.id);
          haptics.tap();
          setCancelled(true);
        },
      },
    ]);
  }

  function bookAgain() {
    router.replace({ pathname: '/researcher/schedule', params: { studentId: student!.id } });
  }

  return (
    <Screen
      footer={
        cancelled ? (
          <Button onPress={bookAgain}>Book another time</Button>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !live }}
              disabled={!live}
              onPress={() => {
                haptics.tap();
                router.replace({
                  pathname: '/researcher/call/[callId]/live',
                  params: { callId: call.id },
                });
              }}
              style={[styles.join, !live && styles.joinLocked]}
            >
              <CameraIcon size={18} color={live ? colors.onPrimary : colors.inkFaint} />
              <Text style={[styles.joinText, !live && { color: colors.inkFaint }]}>
                {live ? 'Join call' : `Opens ${JOIN_EARLY_MIN} min before`}
              </Text>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  haptics.tick();
                  router.push({
                    pathname: '/researcher/schedule',
                    params: { studentId: student.id, replace: call.id },
                  });
                }}
                style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.actionText}>Reschedule</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={confirmCancel}
                style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.actionText, { color: colors.danger }]}>Cancel call</Text>
              </Pressable>
            </View>
          </>
        )
      }
    >
      <BackButton />

      {booked === '1' && !cancelled && (
        <View style={styles.banner}>
          <CheckIcon size={14} color={colors.primary} />
          <Text style={styles.bannerText}>Booked. {first} will get a notification.</Text>
        </View>
      )}
      {cancelled && (
        <View style={[styles.banner, styles.bannerCancelled]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>
            Call cancelled. {first} will get a notification.
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <StudentAvatar id={student.id} name={student.name} size={64} />
        <Text style={styles.with}>Call with {student.name}</Text>
      </View>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>When</Text>
          <Text style={[styles.rowValue, cancelled && styles.struck]}>
            {dayLabel(date, now)}, {time(call.startsAt)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Length</Text>
          <Text style={styles.rowValue}>{call.durationMin} min video</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Repeats</Text>
          <Text style={styles.rowValue}>
            {call.weekly
              ? `Every ${date.toLocaleDateString(undefined, { weekday: 'long' })}`
              : 'Just this once'}
          </Text>
        </View>
        {call.note && (
          <View style={styles.noteRow}>
            <Text style={styles.rowLabel}>Note for {first}</Text>
            <Text style={styles.note}>{call.note}</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  bannerCancelled: { backgroundColor: colors.dangerSoft },
  bannerText: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.mintInk },
  header: { alignItems: 'center', gap: 10, marginTop: 24 },
  with: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  rows: { marginTop: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  rowValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  struck: { textDecorationLine: 'line-through', color: colors.inkFaint },
  noteRow: { gap: 6, paddingVertical: 14 },
  note: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  join: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  joinLocked: { backgroundColor: colors.surfaceMuted },
  joinText: { fontFamily: fonts.bold, fontSize: 16, color: colors.onPrimary },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  action: { paddingVertical: 8 },
  actionText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
