import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CheckIcon, LockIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import Mascot from '@/components/mascot/Mascot';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { sessionContent } from '@/features/sessions/content';
import { MODULE_ICON } from '@/features/sessions/content/types';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { nextModuleId, sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, radius, type } from '@/theme';

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <Screen footer={<Button onPress={() => router.back()}>Back</Button>}>
      <BackButton />
      <View style={styles.placeholder}>
        <Mascot size={110} mood="calm" />
        <Text style={[type.title, styles.center]}>{title}</Text>
        <Text style={[type.body, styles.center]}>{body}</Text>
      </View>
    </Screen>
  );
}

export default function SessionOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const session = SESSIONS.find((s) => s.id === sessionId);
  const content = sessionContent(sessionId);
  const progress = useSessionProgress();
  const [week] = useState(() => currentStudyWeek());

  if (!session) return <Placeholder title="Session not found" body="Head back and pick another." />;

  const record = progress[sessionId];
  if (sessionStatus(sessionId, week, record) === 'locked') {
    return (
      <Placeholder
        title={`Unlocks in week ${sessionId}`}
        body="Each session opens in its own week, so there’s time to practise what you’ve learned."
      />
    );
  }
  if (!content) {
    return (
      <Placeholder
        title={session.title}
        body="This session’s content is still being prepared. Check back soon."
      />
    );
  }

  const next = nextModuleId(content, record);
  const started = (record?.done.length ?? 0) > 0;
  const minutes = content.modules.reduce((sum, m) => sum + m.minutes, 0);

  function open(moduleId: string) {
    router.push(`/session/${sessionId}/${moduleId}`);
  }

  return (
    <Screen
      footer={
        <Button onPress={() => (next ? open(next) : router.push(`/session/${sessionId}/complete`))}>
          {!next ? 'Review summary' : started ? 'Continue' : 'Begin session'}
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={type.eyebrow}>
              Session {session.id} of {SESSIONS.length} · {session.focus}
            </Text>
            <Text style={type.title}>{session.title}</Text>
            <Text style={type.caption}>
              About {minutes} minutes · {content.modules.length} parts
            </Text>
          </View>
          <FeatureIcon name="book" size={64} />
        </View>

        <View style={styles.list}>
          {content.modules.map((module, index) => {
            const done = record?.done.includes(module.id) ?? false;
            const isNext = module.id === next;
            const reachable = done || isNext;
            return (
              <Animated.View key={module.id} entering={FadeInDown.delay(60 * index).duration(320)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !reachable }}
                  accessibilityLabel={`Part ${index + 1}, ${module.title}, ${done ? 'done' : isNext ? 'up next' : 'locked'}`}
                  disabled={!reachable}
                  onPress={() => open(module.id)}
                  style={({ pressed }) => [
                    styles.row,
                    isNext && styles.rowNext,
                    !reachable && styles.rowLocked,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <FeatureIcon name={MODULE_ICON[module.kind]} size={40} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{module.title}</Text>
                    <Text style={styles.rowMeta}>
                      {isNext ? 'Up next · ' : ''}
                      {module.minutes} min
                    </Text>
                  </View>
                  {done ? (
                    <View style={styles.done}>
                      <CheckIcon size={13} color={colors.onPrimary} />
                    </View>
                  ) : !reachable ? (
                    <LockIcon size={16} color={colors.inkFaint} />
                  ) : null}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  body: { marginTop: 20, gap: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerText: { flex: 1, gap: 6 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowNext: { borderColor: colors.primary },
  rowLocked: { opacity: 0.55 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  rowMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  done: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
