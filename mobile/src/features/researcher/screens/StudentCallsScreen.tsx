import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';

import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import MoodFace from '@/features/mood/components/MoodFace';
import { OUTCOME_LABELS } from '@/features/researcher/callLog';
import { callCounts } from '@/features/researcher/caseload';
import { nextCallFor } from '@/features/researcher/studentsLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

function when(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

function CallIcon({ missed }: { missed?: boolean }) {
  return (
    <View style={[styles.icon, missed && styles.iconMissed]} accessibilityElementsHidden>
      <Glyph name="video" size={18} color={missed ? colors.danger : colors.primary} />
    </View>
  );
}

/** Every check-in with this student, like a phone's call history, plus the next one booked. */
export default function StudentCallsScreen() {
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

  const counts = callCounts(student.pastCalls);
  const next = nextCallFor(student.id, calls, now);
  const first = student.name.split(' ')[0];

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Call log</Text>
        <Text style={styles.meta}>
          {student.name} · {counts.total} {counts.total === 1 ? 'call' : 'calls'}
          {counts.missed > 0 ? ` · ${counts.missed} missed` : ''}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Next</Text>
      {next ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Next call ${when(next.startsAt)}`}
          onPress={() => {
            haptics.tick();
            router.push({ pathname: '/researcher/call/[callId]', params: { callId: next.id } });
          }}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
        >
          <CallIcon />
          <View style={styles.text}>
            <Text style={styles.when}>{when(next.startsAt)}</Text>
            <Text style={styles.detail}>{next.durationMin} min video check-in</Text>
          </View>
          <ChevronRightIcon size={16} color={colors.inkFaint} />
        </Pressable>
      ) : (
        <Text style={styles.empty}>No call booked yet.</Text>
      )}

      <Text style={styles.sectionTitle}>Past calls</Text>
      {student.pastCalls.length === 0 ? (
        <Text style={styles.empty}>No calls with {first} yet.</Text>
      ) : (
        student.pastCalls.map((call, i) => {
          const rating = call.feedback?.rating;
          const label = call.attended
            ? `${when(call.startsAt)}, ${call.minutes} minutes`
            : `${when(call.startsAt)}, missed`;
          return (
            <View
              key={call.startsAt}
              style={[styles.row, i > 0 && styles.divider]}
              accessible
              accessibilityLabel={[
                label,
                call.feedback?.note && `${first} said: ${call.feedback.note}`,
                call.researcherNote?.outcome && OUTCOME_LABELS[call.researcherNote.outcome],
                call.researcherNote?.text && `Your note: ${call.researcherNote.text}`,
              ]
                .filter(Boolean)
                .join('. ')}
            >
              <CallIcon missed={!call.attended} />
              <View style={styles.text}>
                <Text style={styles.when}>{when(call.startsAt)}</Text>
                <Text style={[styles.detail, !call.attended && styles.missed]}>
                  {call.attended ? `${call.minutes} min` : 'Missed'}
                </Text>
                {call.feedback?.note && <Text style={styles.note}>“{call.feedback.note}”</Text>}
                {call.researcherNote && (
                  <View style={styles.yours}>
                    <Text style={styles.yoursLabel}>
                      Your note
                      {call.researcherNote.outcome && (
                        <Text style={call.researcherNote.outcome === 'concerns' && styles.concerns}>
                          {' '}
                          · {OUTCOME_LABELS[call.researcherNote.outcome]}
                        </Text>
                      )}
                    </Text>
                    {call.researcherNote.text && (
                      <Text style={styles.yoursText}>{call.researcherNote.text}</Text>
                    )}
                  </View>
                )}
              </View>
              {rating !== undefined && rating !== null && <MoodFace mood={rating} size={26} />}
            </View>
          );
        })
      )}

      <Text style={styles.footnote}>
        Calls are never recorded. Ratings and quotes are what {first} chose to share after each
        call. Your notes are seen only by you and the study team.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMissed: { backgroundColor: colors.dangerSoft },
  text: { flex: 1, gap: 2 },
  when: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  detail: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  missed: { fontFamily: fonts.bold, color: colors.danger },
  note: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  yours: {
    gap: 2,
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  yoursLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
  concerns: { color: '#B7801A' },
  yoursText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.ink },
  empty: { paddingVertical: 8, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  footnote: {
    marginTop: 28,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkFaint,
  },
});
