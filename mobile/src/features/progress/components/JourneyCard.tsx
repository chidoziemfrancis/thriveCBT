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
        <Text style={styles.title}>Your plan</Text>
        {/* iOS doesn't round a Text's own background, so the pill is a View. */}
        <View style={styles.weekPill}>
          <Text style={styles.week}>
            WEEK {week}/{SESSIONS.length}
          </Text>
        </View>
        <View style={styles.spacer} />
        <Text style={styles.more}>Sessions</Text>
        <ChevronRightIcon size={14} color={colors.primary} />
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  weekPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  week: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, color: colors.primary },
  spacer: { flex: 1 },
  more: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
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
