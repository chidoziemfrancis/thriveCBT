import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CheckIcon, LockIcon } from '@/components/icons';
import Screen from '@/components/ui/Screen';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { sessionContent } from '@/features/sessions/content';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { SessionStatus, modulesDone, sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, radius, type } from '@/theme';

function statusLabel(status: SessionStatus, sessionId: number, done: number, total: number) {
  switch (status) {
    case 'done':
      return 'Completed';
    case 'current':
      return total ? `This week · ${done} of ${total} parts` : 'This week';
    case 'available':
      return 'Open to catch up';
    case 'locked':
      return `Unlocks in week ${sessionId}`;
  }
}

export default function SessionsScreen() {
  const progress = useSessionProgress();
  const [week, setWeek] = useState(() => currentStudyWeek());

  // A new session can unlock while the app stays open across a week boundary.
  useFocusEffect(useCallback(() => setWeek(currentStudyWeek()), []));

  const completed = SESSIONS.filter((s) => progress[s.id]?.completedAt).length;

  return (
    <Screen insideTabs>
      <Text style={type.title}>Your sessions</Text>
      <Text style={[type.body, styles.subtitle]}>
        {completed} of {SESSIONS.length} complete · a new session opens each week
      </Text>

      <View style={styles.list}>
        {SESSIONS.map((session, index) => {
          const record = progress[session.id];
          const status = sessionStatus(session.id, week, record);
          const content = sessionContent(session.id);
          const total = content?.modules.length ?? 0;
          const done = content ? modulesDone(content, record) : 0;
          const locked = status === 'locked';
          const isLast = index === SESSIONS.length - 1;

          return (
            <Animated.View
              key={session.id}
              entering={FadeInDown.delay(50 * index).duration(320)}
              style={styles.item}
            >
              <View style={styles.rail}>
                <View
                  style={[
                    styles.node,
                    status === 'done' && styles.nodeDone,
                    status === 'current' && styles.nodeCurrent,
                  ]}
                >
                  {status === 'done' ? (
                    <CheckIcon size={14} color={colors.onPrimary} />
                  ) : locked ? (
                    <LockIcon size={13} color={colors.inkFaint} />
                  ) : (
                    <Text style={styles.nodeText}>{session.id}</Text>
                  )}
                </View>
                {!isLast && <View style={[styles.line, status === 'done' && styles.lineDone]} />}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: locked }}
                accessibilityLabel={`Session ${session.id}, ${session.title}, ${statusLabel(status, session.id, done, total)}`}
                disabled={locked}
                onPress={() => router.push(`/session/${session.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  status === 'current' && styles.cardCurrent,
                  locked && styles.cardLocked,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.cardTitle}>{session.title}</Text>
                <Text style={styles.cardFocus}>{session.focus}</Text>
                <Text
                  style={[styles.cardStatus, status === 'current' && { color: colors.primary }]}
                >
                  {statusLabel(status, session.id, done, total)}
                </Text>
                {status === 'current' && total > 0 && (
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${(done / total) * 100}%` }]} />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const NODE = 34;

const styles = StyleSheet.create({
  subtitle: { marginTop: 6 },
  list: { marginTop: 22 },
  item: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center' },
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
  nodeText: { fontFamily: fonts.heavy, fontSize: 14, color: colors.primary },
  line: { flex: 1, width: 3, marginVertical: 4, borderRadius: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
  card: {
    flex: 1,
    gap: 3,
    marginBottom: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardCurrent: { borderColor: colors.primary },
  cardLocked: { opacity: 0.55 },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  cardFocus: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  cardStatus: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted, marginTop: 4 },
  track: {
    height: 6,
    marginTop: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
});
