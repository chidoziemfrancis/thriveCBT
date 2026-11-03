import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { summariseSession } from '@/features/researcher/sessionSummary';
import { useResearcher } from '@/features/researcher/useResearcher';
import { sessionContent } from '@/features/sessions/content';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, radius, type } from '@/theme';

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** What one student did in one session, part by part, like a submitted assignment. */
export default function StudentSessionScreen() {
  const { id, session: sessionParam } = useLocalSearchParams<{ id: string; session: string }>();
  const { students } = useResearcher();
  const student = students.find((s) => s.id === id);
  const sessionId = Number(sessionParam);
  const session = SESSIONS.find((s) => s.id === sessionId);

  if (!student || !session) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This session couldn’t be found.</Text>
      </Screen>
    );
  }

  const record = student.sessions[sessionId];
  const content = sessionContent(sessionId);
  const parts = content ? summariseSession(content, record) : [];
  const first = student.name.split(' ')[0];

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Session {session.id}</Text>
        <Text style={type.title}>{session.title}</Text>
        <Text style={styles.meta}>
          {student.name} ·{' '}
          {record?.completedAt
            ? `Completed ${longDate(record.completedAt)}`
            : record?.done.length
              ? 'In progress'
              : 'Not started'}
        </Text>
      </View>

      {!content ? (
        <Text style={styles.note}>
          {record?.completedAt
            ? `${first} finished this session. Its content isn’t written yet, so there are no answers to show.`
            : 'This session’s content isn’t written yet.'}
        </Text>
      ) : (
        parts.map((part) => (
          <View key={part.id} style={styles.part}>
            <View style={styles.partHead}>
              <Text style={styles.partTitle}>{part.title}</Text>
              {part.done ? (
                <View style={styles.done}>
                  <CheckIcon size={10} color={colors.onPrimary} />
                  <Text style={styles.doneText}>Done</Text>
                </View>
              ) : (
                <Text style={styles.todo}>To do</Text>
              )}
            </View>

            {part.lines.map((line) => (
              <View key={line.label} style={styles.line}>
                <Text style={styles.lineLabel}>{line.label}</Text>
                <Text style={styles.lineValue}>{line.value}</Text>
              </View>
            ))}

            {part.reflection && (
              <View style={styles.quote}>
                <Text style={styles.quoteText}>“{part.reflection}”</Text>
              </View>
            )}

            {part.done && part.lines.length === 0 && !part.reflection && (
              <Text style={styles.empty}>Read through, nothing to answer.</Text>
            )}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  note: {
    marginTop: 24,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  part: {
    gap: 10,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partTitle: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  doneText: { fontFamily: fonts.bold, fontSize: 11, color: colors.onPrimary },
  todo: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkFaint },
  line: { gap: 2 },
  lineLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  lineValue: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
  quote: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  quoteText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink },
  empty: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
});
