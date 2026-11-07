import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CheckIcon, LockIcon } from '@/components/icons';
import Mascot from '@/components/mascot/Mascot';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { currentStudyWeek } from '@/features/home/currentWeek';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import { sessionContent } from '@/features/sessions/content';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { nextModuleId, sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, type } from '@/theme';

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
          {!next ? 'Review summary' : started ? 'Continue' : 'Begin'}
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        {content.hero && (
          <Animated.View entering={FadeIn.duration(400)}>
            <SessionPhoto photo={content.hero} style={styles.hero} />
          </Animated.View>
        )}

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Week {session.id}</Text>
          <Text style={type.title}>{session.title}</Text>
          <Text style={styles.meta}>
            About {minutes} min · {content.modules.length} parts
          </Text>
        </View>

        <View>
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
                    index > 0 && styles.divider,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <View style={[styles.num, isNext && styles.numNext, done && styles.numDone]}>
                    {done ? (
                      <CheckIcon size={12} color={colors.onPrimary} />
                    ) : (
                      <Text style={[styles.numText, isNext && { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.rowTitle, !reachable && styles.faded]}>{module.title}</Text>
                  <Text style={[styles.rowMeta, !reachable && styles.faded]}>
                    {module.minutes} min
                  </Text>
                  {!reachable && <LockIcon size={14} color={colors.inkFaint} />}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const NUM = 28;

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  body: { marginTop: 16, gap: 20 },
  hero: { height: 220 },
  headerText: { gap: 6 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  num: {
    width: NUM,
    height: NUM,
    borderRadius: NUM / 2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numNext: { borderColor: colors.primary },
  numDone: { borderColor: colors.primary, backgroundColor: colors.primary },
  numText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  rowTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  rowMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  faded: { opacity: 0.45 },
});
