import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { severityBand } from '@/features/assessment/phq9';
import { daysAgoLabel } from '@/features/journal/journalLogic';
import { MOODS } from '@/features/mood/moods';
import { dailyMoods, mostCommonMood } from '@/features/progress/progressLogic';
import { sessionsCompleted } from '@/features/researcher/caseload';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { activeLabel, nextCallFor } from '@/features/researcher/studentsLogic';
import { needsYou } from '@/features/researcher/todayLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function callLabel(iso: string, now: Date) {
  const date = new Date(iso);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const day =
    date.toDateString() === now.toDateString()
      ? 'Today'
      : date.toDateString() === tomorrow.toDateString()
        ? 'Tomorrow'
        : date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

function joinedLabel(iso: string, now: Date) {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 14) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: FeatureIconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.actionCircle}>
        <Glyph name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function Row({
  label,
  children,
  onPress,
}: {
  label: string;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
      {onPress && <ChevronRightIcon size={16} color={colors.inkFaint} />}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, see details`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      {content}
    </Pressable>
  );
}

// Messaging, calls and booking are built next; until then the buttons say so honestly.
function comingSoon(what: string) {
  Alert.alert('Coming soon', `${what} for researchers is on the way.`);
}

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, calls, now } = useResearcher();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This student isn’t in your caseload.</Text>
      </Screen>
    );
  }

  const alert = needsYou([student], now)[0];
  const weekMood = mostCommonMood(dailyMoods(student.moods, 7, now));
  const next = nextCallFor(student.id, calls, now);

  return (
    <Screen>
      <BackButton />

      <View style={styles.header}>
        <StudentAvatar id={student.id} name={student.name} size={88} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>
          Week {student.week} · {activeLabel(student.lastActiveAt, now)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Action icon="chat" label="Message" onPress={() => comingSoon('Messaging')} />
        <Action icon="video" label="Call" onPress={() => comingSoon('Video calling')} />
        <Action icon="calendar" label="Schedule" onPress={() => comingSoon('Booking calls')} />
      </View>

      {alert && (
        <View style={[styles.alert, !alert.urgent && styles.alertSoft]}>
          <View style={[styles.alertDot, !alert.urgent && { backgroundColor: '#D9A21B' }]} />
          <Text style={[styles.alertText, !alert.urgent && { color: colors.ink }]}>
            {alert.reason}
          </Text>
        </View>
      )}

      <View style={styles.rows}>
        <Row
          label="Mood"
          onPress={() => {
            haptics.tick();
            router.push({ pathname: '/researcher/student/[id]/moods', params: { id: student.id } });
          }}
        >
          <Text style={styles.value}>
            {weekMood === null
              ? 'No moods this week'
              : `Mostly ${MOODS[weekMood].label.toLowerCase()} this week`}
          </Text>
        </Row>
        <Row
          label="PHQ-9"
          onPress={() => {
            haptics.tick();
            router.push({ pathname: '/researcher/student/[id]/phq9', params: { id: student.id } });
          }}
        >
          <Text style={styles.value}>
            {student.phq9.score} · {severityBand(student.phq9.score)}
          </Text>
        </Row>
        <Row
          label="Sessions"
          onPress={() => {
            haptics.tick();
            router.push({
              pathname: '/researcher/student/[id]/sessions',
              params: { id: student.id },
            });
          }}
        >
          <Text style={styles.value}>
            {sessionsCompleted(student)} of {SESSIONS.length}
          </Text>
        </Row>
        <Row
          label="Journal"
          onPress={() => {
            haptics.tick();
            router.push({
              pathname: '/researcher/student/[id]/journal',
              params: { id: student.id },
            });
          }}
        >
          <Text style={styles.value}>
            {student.journal.length === 0
              ? 'No entries yet'
              : `${student.journal.length} ${student.journal.length === 1 ? 'entry' : 'entries'} · last ${daysAgoLabel(
                  [...student.journal].sort((a, b) => b.at.localeCompare(a.at))[0].at,
                  now
                )}`}
          </Text>
        </Row>
        <Row label="Next call">
          <Text style={styles.value}>{next ? callLabel(next.startsAt, now) : 'None booked'}</Text>
        </Row>
        <Row label="Joined">
          <Text style={styles.value}>
            {joinedLabel(student.joinedAt, now)} ·{' '}
            {student.joinedBy === 'invite' ? 'by invite' : 'random match'}
          </Text>
        </Row>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { alignItems: 'center', gap: 6, marginTop: 8 },
  name: { marginTop: 8, fontFamily: fonts.heavy, fontSize: 24, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 22 },
  action: { alignItems: 'center', gap: 6 },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  alertSoft: { backgroundColor: colors.butter },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  alertText: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.danger },
  rows: { marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  rowValue: { flex: 1, alignItems: 'flex-end' },
  value: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: 'right' },
});
