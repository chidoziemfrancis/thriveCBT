import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CameraIcon } from '@/components/icons';
import Screen from '@/components/ui/Screen';
import { firstName, initials } from '@/features/assignment/assign';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { signOut } from '@/features/auth/signOut';
import { getUserSession } from '@/features/auth/userSession';
import { JOIN_EARLY_MIN, countdownLabel } from '@/features/checkin/checkinLogic';
import type { Call, CaseloadStudent } from '@/features/researcher/caseload';
import {
  callState,
  callsToday,
  greeting,
  needsYou,
  nextCall,
} from '@/features/researcher/todayLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function today(now: Date) {
  return now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function Initials({ name }: { name: string }) {
  return (
    <View style={styles.initials} accessibilityElementsHidden>
      <Text style={styles.initialsText}>{initials(name)}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function NextCall({ call, student, now }: { call: Call; student: CaseloadStudent; now: Date }) {
  const live = callState(call, now) === 'live';
  return (
    <View style={styles.next}>
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
    </View>
  );
}

export default function ResearcherHomeScreen() {
  const { researcher, students, calls, now } = useResearcher();
  const byId = (id: string) => students.find((s) => s.id === id);

  const next = nextCall(calls, now);
  const nextStudent = next && byId(next.studentId);
  const later = callsToday(calls, now).filter((c) => c !== next && callState(c, now) !== 'done');
  const flagged = needsYou(students, now);

  // Settings get their own screen later; until then the photo is where to log out.
  function openAccount() {
    haptics.tap();
    Alert.alert(researcher?.name ?? 'Your account', getUserSession().email ?? '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <Screen>
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
          accessibilityLabel="Your account"
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
          <NextCall call={next} student={nextStudent} now={now} />
        ) : (
          <Text style={styles.empty}>No more calls today.</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).duration(320)} style={styles.section}>
        <SectionTitle>Needs you</SectionTitle>
        {flagged.length === 0 ? (
          <Text style={styles.empty}>Nothing urgent. Everyone is okay.</Text>
        ) : (
          flagged.map(({ student, reason, urgent }, i) => (
            <View
              key={student.id}
              style={[styles.row, i > 0 && styles.divider]}
              accessible
              accessibilityLabel={`${urgent ? 'Urgent. ' : ''}${student.name}: ${reason}`}
            >
              <View style={[styles.dot, { backgroundColor: urgent ? colors.danger : '#D9A21B' }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{student.name}</Text>
                <Text style={[styles.rowMeta, urgent && { color: colors.danger }]}>{reason}</Text>
              </View>
            </View>
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
              <View
                key={call.startsAt}
                style={[styles.row, i > 0 && styles.divider]}
                accessible
                accessibilityLabel={`${time(call.startsAt)}, ${student.name}, week ${student.week}`}
              >
                <Text style={styles.rowTime}>{time(call.startsAt)}</Text>
                <Initials name={student.name} />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{student.name}</Text>
                  <Text style={styles.rowMeta}>Week {student.week}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      )}
    </Screen>
  );
}

const PHOTO = 44;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
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
  rowTime: { width: 64, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  initials: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
});
