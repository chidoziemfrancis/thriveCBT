import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import Icon3D from '@/components/icons/Icon3D';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { sessionContent } from '@/features/sessions/content';
import { completeSession } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

export default function SessionCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const content = sessionContent(sessionId);
  const session = SESSIONS.find((s) => s.id === sessionId);

  useEffect(() => {
    if (!content) return;
    completeSession(sessionId);
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, [content, sessionId]);

  if (!content || !session) return <Redirect href="/dashboard" />;

  return (
    <Screen footer={<Button onPress={() => router.replace('/dashboard')}>Back to home</Button>}>
      <View style={styles.body}>
        <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.center}>
          <Icon3D name="trophy" size={120} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.header}>
          <Text style={type.eyebrow}>
            Session {session.id} of {SESSIONS.length}
          </Text>
          <Text style={[type.title, styles.centerText]}>Session complete!</Text>
          <Text style={[type.body, styles.centerText]}>
            Great work finishing “{session.title}”. That’s a real step.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>What you learned</Text>
          {content.takeaways.map((takeaway) => (
            <View key={takeaway} style={styles.row}>
              <View style={styles.check}>
                <CheckIcon size={12} color={colors.onPrimary} />
              </View>
              <Text style={styles.rowText}>{takeaway}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.practice}>
          <Icon3D name="sun" size={40} />
          <View style={styles.practiceText}>
            <Text style={styles.cardTitle}>This week’s practice</Text>
            <Text style={styles.rowText}>{content.practice}</Text>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 16, gap: 18 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  header: { alignItems: 'center', gap: 6 },
  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  check: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  practiceText: { flex: 1, gap: 4 },
});
