import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ChevronRightIcon, LockIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { sessionsCompleted } from '@/features/researcher/caseload';
import { useResearcher } from '@/features/researcher/useResearcher';
import { sessionContent } from '@/features/sessions/content';
import { modulesDone, sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Every session for one student, like a teacher's view of a pupil's assignments. */
export default function StudentSessionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students } = useResearcher();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This student isn’t in your caseload.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Sessions</Text>
        <Text style={styles.meta}>
          {student.name} · {sessionsCompleted(student)} of {SESSIONS.length} done
        </Text>
      </View>

      <View style={styles.list}>
        {SESSIONS.map((session, i) => {
          const record = student.sessions[session.id];
          const status = sessionStatus(session.id, student.week, record);
          const content = sessionContent(session.id);
          const locked = status === 'locked';
          const label =
            status === 'done' && record?.completedAt
              ? `Done · ${shortDate(record.completedAt)}`
              : status === 'locked'
                ? `Opens week ${session.id}`
                : record?.done.length
                  ? content
                    ? `${modulesDone(content, record)} of ${content.modules.length} parts`
                    : 'Started'
                  : status === 'current'
                    ? 'This week · not started'
                    : 'Not started';

          return (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: locked }}
              accessibilityLabel={`Session ${session.id}, ${session.title}, ${label}`}
              disabled={locked}
              onPress={() => {
                haptics.tick();
                router.push({
                  pathname: '/researcher/student/[id]/session/[session]',
                  params: { id: student.id, session: String(session.id) },
                });
              }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.divider,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.number, locked && styles.faded]}>
                {String(session.id).padStart(2, '0')}
              </Text>
              <View style={[styles.text, locked && styles.faded]}>
                <Text style={styles.title} numberOfLines={2}>
                  {session.title}
                </Text>
                <Text style={[styles.status, status === 'done' && { color: colors.primary }]}>
                  {label}
                </Text>
              </View>
              {status === 'done' ? (
                <View style={styles.tick}>
                  <CheckIcon size={12} color={colors.onPrimary} />
                </View>
              ) : locked ? (
                <LockIcon size={14} color={colors.inkFaint} />
              ) : (
                <ChevronRightIcon size={16} color={colors.inkFaint} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  list: { marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  number: { width: 28, fontFamily: fonts.medium, fontSize: 16, color: colors.inkFaint },
  faded: { opacity: 0.4 },
  text: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.ink },
  status: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  tick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
