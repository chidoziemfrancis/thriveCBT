import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import type { SessionRecord } from '@/features/sessions/sessionLogic';
import { sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, radius } from '@/theme';

export default function JourneyCard({
  week,
  progress,
}: {
  week: number;
  progress: Record<number, SessionRecord>;
}) {
  const done = SESSIONS.filter((s) => progress[s.id]?.completedAt).length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Week ${week} of ${SESSIONS.length}. ${done} of ${SESSIONS.length} sessions done. Open sessions.`}
      onPress={() => router.navigate('/sessions')}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.eyebrow}>Your journey</Text>
          <Text style={styles.title}>
            Week {week} of {SESSIONS.length}
          </Text>
        </View>
        <ChevronRightIcon color={colors.inkFaint} />
      </View>

      <View style={styles.track} accessibilityElementsHidden>
        {SESSIONS.map((session, i) => {
          const status = sessionStatus(session.id, week, progress[session.id]);
          const reached = status !== 'locked';
          return (
            <Fragment key={session.id}>
              {i > 0 && <View style={[styles.link, reached && styles.linkReached]} />}
              <View
                style={[
                  styles.node,
                  status === 'done' && styles.nodeDone,
                  status === 'current' && styles.nodeCurrent,
                  status === 'available' && styles.nodeOpen,
                ]}
              >
                {status === 'done' ? (
                  <CheckIcon size={12} color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.nodeText, !reached && { color: colors.inkFaint }]}>
                    {session.id}
                  </Text>
                )}
              </View>
            </Fragment>
          );
        })}
      </View>

      <Text style={styles.meta}>
        {done === 0
          ? 'Your first session is waiting for you.'
          : `${done} of ${SESSIONS.length} sessions done. Keep going at your own pace.`}
      </Text>
    </Pressable>
  );
}

const NODE = 28;

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  title: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  track: { flexDirection: 'row', alignItems: 'center' },
  link: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  linkReached: { backgroundColor: colors.primary },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.primary },
  nodeCurrent: { backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.primary },
  nodeOpen: { backgroundColor: colors.primarySoft },
  nodeText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.primary },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
});
