import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { currentStudyWeek, studyStart } from '@/features/home/currentWeek';
import { opensLabel, sessionOpensOn } from '@/features/home/studyWeek';
import { sessionContent } from '@/features/sessions/content';
import { useSessionProgress } from '@/features/sessions/progressStore';
import {
  type SessionRecord,
  type SessionStatus,
  modulesDone,
  sessionStatus,
} from '@/features/sessions/sessionLogic';
import { SESSIONS, type Session } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const NODE = 26;

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function Node({ status }: { status: SessionStatus }) {
  if (status === 'done') {
    return (
      <View style={[styles.node, styles.nodeDone]}>
        <CheckIcon size={12} color={colors.onPrimary} />
      </View>
    );
  }
  if (status === 'current') {
    return (
      <View style={[styles.node, styles.nodeCurrent]}>
        <View style={styles.nodeCore} />
      </View>
    );
  }
  return <View style={[styles.node, status === 'available' && styles.nodeOpen]} />;
}

function Stop({
  session,
  status,
  record,
  opensOn,
  now,
  last,
}: {
  session: Session;
  status: SessionStatus;
  record?: SessionRecord;
  opensOn: Date;
  now: Date;
  last: boolean;
}) {
  const content = sessionContent(session.id);
  const parts = content?.modules.length ?? 0;
  const partsDone = content ? modulesDone(content, record) : 0;
  const locked = status === 'locked';
  const current = status === 'current';

  const meta =
    status === 'done' && record?.completedAt
      ? `Done · ${shortDate(record.completedAt)}`
      : locked
        ? opensLabel(opensOn, now)
        : parts > 0
          ? `${session.focus} · ${partsDone} of ${parts} parts`
          : session.focus;

  function open() {
    haptics.tick();
    router.push(`/session/${session.id}`);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`Session ${session.id}, ${session.title}. ${current ? 'This week. ' : ''}${meta}`}
      disabled={locked}
      onPress={open}
      style={({ pressed }) => [styles.stop, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rail}>
        <Node status={status} />
        {!last && <View style={[styles.line, status === 'done' && styles.lineDone]} />}
      </View>

      <View style={[styles.body, last && { paddingBottom: 0 }]}>
        {current && <Text style={styles.eyebrow}>This week · Session {session.id}</Text>}
        <Text style={[styles.title, current && styles.titleCurrent, locked && styles.faded]}>
          {session.title}
        </Text>
        <Text style={[styles.meta, locked && styles.faded]}>{meta}</Text>

        {current && (
          <>
            {parts > 0 && (
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(partsDone / parts) * 100}%` }]} />
              </View>
            )}
            <View style={styles.cta}>
              <Button onPress={open}>{partsDone > 0 ? 'Continue' : 'Start'}</Button>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

export default function SessionsScreen() {
  const progress = useSessionProgress();
  const [now, setNow] = useState(() => new Date());

  // A new session can unlock while the app stays open across a week boundary.
  useFocusEffect(useCallback(() => setNow(new Date()), []));

  const week = currentStudyWeek(now);
  const start = studyStart();
  const statuses = SESSIONS.map((s) => sessionStatus(s.id, week, progress[s.id]));
  const completed = statuses.filter((s) => s === 'done').length;

  return (
    <Screen insideTabs>
      <Text style={type.title}>Your sessions</Text>
      <Text style={styles.subtitle}>
        Week {week} of {SESSIONS.length} · {completed} done
      </Text>

      <View style={styles.path}>
        {SESSIONS.map((session, i) => (
          <Animated.View key={session.id} entering={FadeInDown.delay(40 * i).duration(300)}>
            <Stop
              session={session}
              status={statuses[i]}
              record={progress[session.id]}
              opensOn={sessionOpensOn(start, session.id, now)}
              now={now}
              last={i === SESSIONS.length - 1}
            />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  path: { marginTop: 24 },
  stop: { flexDirection: 'row', gap: 14 },
  rail: { width: NODE, alignItems: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { borderColor: colors.primary, backgroundColor: colors.primary },
  nodeCurrent: { borderColor: colors.primary },
  nodeCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  nodeOpen: { borderColor: colors.primary, borderStyle: 'dashed' },
  line: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
  body: { flex: 1, gap: 3, paddingTop: 2, paddingBottom: 26 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, color: colors.ink },
  titleCurrent: { fontSize: 19, lineHeight: 25 },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  faded: { opacity: 0.45 },
  track: {
    height: 4,
    marginTop: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  cta: { marginTop: 14, alignSelf: 'flex-start', minWidth: 150 },
});
