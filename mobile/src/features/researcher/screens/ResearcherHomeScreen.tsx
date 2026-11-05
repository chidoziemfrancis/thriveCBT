import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CameraIcon, ChevronRightIcon } from '@/components/icons';
import Screen from '@/components/ui/Screen';
import { firstName } from '@/features/assignment/assign';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { JOIN_EARLY_MIN, countdownLabel } from '@/features/checkin/checkinLogic';
import type { Call, CaseloadStudent } from '@/features/researcher/caseload';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import {
  callState,
  callsToday,
  greeting,
  needsYou,
  nextCall,
} from '@/features/researcher/todayLogic';
import { alertStatus } from '@/features/researcher/alerts';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function today(now: Date) {
  return now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function NextCall({
  call,
  student,
  now,
  onOpen,
}: {
  call: Call;
  student: CaseloadStudent;
  now: Date;
  onOpen: () => void;
}) {
  const live = callState(call, now) === 'live';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Next call, ${time(call.startsAt)}, ${student.name}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.next, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.nextText}>
        <Text style={styles.nextTime}>{time(call.startsAt)}</Text>
        <Text style={styles.nextName}>{student.name}</Text>
        <Text style={styles.nextMeta}>
          Week {student.week} · {live ? 'Happening now' : countdownLabel(call.startsAt, now)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !live }}
        accessibilityHint={live ? undefined : `Opens ${JOIN_EARLY_MIN} minutes before`}
        disabled={!live}
        // The researcher's call screen comes with the calls work.
        onPress={() => Alert.alert('Coming soon', 'Video calls for researchers are on the way.')}
        style={({ pressed }) => [
          styles.join,
          !live && styles.joinLocked,
          pressed && { opacity: 0.85 },
        ]}
      >
        <CameraIcon size={16} color={live ? colors.onPrimary : colors.inkFaint} />
        <Text style={[styles.joinText, !live && { color: colors.inkFaint }]}>Join</Text>
      </Pressable>
    </Pressable>
  );
}

export default function ResearcherHomeScreen() {
  const { researcher, students, calls, now, handled, alertEvents } = useResearcher();
  const byId = (id: string) => students.find((s) => s.id === id);

  const next = nextCall(calls, now);
  const nextStudent = next && byId(next.studentId);
  const later = callsToday(calls, now).filter((c) => c !== next && callState(c, now) !== 'done');
  const flagged = needsYou(students, now, handled);

  function openCall(id: string) {
    haptics.tick();
    router.push({ pathname: '/researcher/call/[callId]', params: { callId: id } });
  }

  function openAccount() {
    haptics.tap();
    router.push('/researcher/settings');
  }

  return (
    <Screen insideTabs>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.date}>{today(now)}</Text>
          <Text style={type.title}>
            {greeting(now)}
            {researcher ? `, ${firstName(researcher.name)}` : ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your settings"
          onPress={openAccount}
          style={styles.photo}
        >
          <ResearcherPhoto
            researcher={researcher ?? undefined}
            initialsStyle={styles.photoInitials}
          />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(320)} style={styles.section}>
        <SectionTitle>Next call</SectionTitle>
        {next && nextStudent ? (
          <NextCall call={next} student={nextStudent} now={now} onOpen={() => openCall(next.id)} />
        ) : (
          <Text style={styles.empty}>No more calls today.</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).duration(320)} style={styles.section}>
        <SectionTitle>Needs you</SectionTitle>
        {flagged.length === 0 ? (
          <Text style={styles.empty}>Nothing urgent. Everyone is okay.</Text>
        ) : (
          flagged.map(({ student, reason, urgent, alertId }, i) => (
            <Pressable
              key={student.id}
              accessibilityRole="button"
              accessibilityLabel={`${urgent ? 'Urgent. ' : ''}${student.name}: ${reason}`}
              onPress={() => {
                haptics.tick();
                router.push({ pathname: '/researcher/alert/[id]', params: { id: alertId } });
              }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.divider,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: urgent ? colors.danger : '#D9A21B' }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{student.name}</Text>
                <Text style={[styles.rowMeta, urgent && { color: colors.danger }]}>{reason}</Text>
                {alertStatus(alertEvents[alertId]) === 'acknowledged' && (
                  <Text style={styles.onIt}>You’re on it</Text>
                )}
              </View>
              <ChevronRightIcon size={16} color={colors.inkFaint} />
            </Pressable>
          ))
        )}
      </Animated.View>

      {later.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).duration(320)} style={styles.section}>
          <SectionTitle>Later today</SectionTitle>
          {later.map((call, i) => {
            const student = byId(call.studentId);
            if (!student) return null;
            return (
              <Pressable
                key={call.id}
                accessibilityRole="button"
                accessibilityLabel={`${time(call.startsAt)}, ${student.name}, week ${student.week}`}
                onPress={() => openCall(call.id)}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && styles.divider,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.rowTime}>{time(call.startsAt)}</Text>
                <StudentAvatar id={student.id} name={student.name} size={34} />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{student.name}</Text>
                  <Text style={styles.rowMeta}>Week {student.week}</Text>
                </View>
                <ChevronRightIcon size={16} color={colors.inkFaint} />
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptics.tick();
          router.push('/researcher/calls');
        }}
        hitSlop={8}
        style={styles.allCalls}
      >
        <Text style={styles.allCallsText}>See all calls</Text>
        <ChevronRightIcon size={14} color={colors.primary} />
      </Pressable>
    </Screen>
  );
}

const PHOTO = 44;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  allCalls: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 24 },
  allCallsText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  headerText: { flex: 1, gap: 2 },
  date: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoInitials: { fontFamily: fonts.heavy, fontSize: 16, color: colors.lavenderInk },
  section: { marginTop: 28, gap: 4 },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  empty: { paddingVertical: 8, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  // The one highlighted thing on the screen: a flat, softly tinted block.
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  nextText: { flex: 1, gap: 2 },
  nextTime: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink },
  nextName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  nextMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  join: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  joinLocked: { backgroundColor: colors.surface },
  joinText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  rowMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  onIt: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  rowTime: { width: 64, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
