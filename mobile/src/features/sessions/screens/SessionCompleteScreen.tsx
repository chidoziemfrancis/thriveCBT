import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { askForReminders, remindersAllowed } from '@/features/onboarding/reminders';
import SunRise from '@/features/sessions/art/SunRise';
import { sessionContent } from '@/features/sessions/content';
import { completeSession } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { getPreferences, setPreference } from '@/lib/preferences';
import { colors, fonts, radius, type } from '@/theme';

export default function SessionCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const content = sessionContent(sessionId);
  const session = SESSIONS.find((s) => s.id === sessionId);
  const [reminding, setReminding] = useState(false);

  useEffect(() => {
    remindersAllowed().then((allowed) => setReminding(allowed && getPreferences().notifyMood));
  }, []);

  useEffect(() => {
    if (!content) return;
    completeSession(sessionId);
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, [content, sessionId]);

  if (!content || !session) return <Redirect href="/dashboard" />;

  async function remindMe() {
    setPreference('notifyMood', true);
    const granted = await askForReminders();
    if (granted) haptics.success();
    setReminding(granted);
  }

  return (
    <Screen footer={<Button onPress={() => router.replace('/dashboard')}>Back to home</Button>}>
      <View style={styles.body}>
        <SunRise />

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.header}>
          <Text style={styles.eyebrow}>Week {session.id} done</Text>
          <Text style={type.title}>Well done for showing up</Text>
          <Text style={type.body}>You finished “{session.title}”. That’s a real step.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>What you learned</Text>
          {content.takeaways.map((takeaway, i) => (
            <View key={takeaway} style={[styles.row, i > 0 && styles.divider]}>
              <View style={styles.check}>
                <CheckIcon size={11} color={colors.onPrimary} />
              </View>
              <Text style={styles.rowText}>{takeaway}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>This week’s practice</Text>
          <View style={styles.practice}>
            <View style={styles.icon}>
              <Glyph name="heart" size={18} color={colors.primary} />
            </View>
            <Text style={styles.rowText}>{content.practice}</Text>
          </View>
          {content.practiceAction && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptics.tap();
                router.push(
                  content.practiceAction === 'challenge'
                    ? '/thought-log/challenge'
                    : '/thought-log/new'
                );
              }}
              style={({ pressed }) => [styles.remind, pressed && { opacity: 0.8 }]}
            >
              <Glyph name="bulb" size={16} color={colors.primary} />
              <Text style={styles.remindText}>
                {content.practiceAction === 'challenge'
                  ? 'Challenge a thought'
                  : 'New thought record'}
              </Text>
            </Pressable>
          )}
          {reminding ? (
            <Animated.View entering={FadeIn.duration(250)} style={styles.reminderOn}>
              <CheckIcon size={12} color={colors.primary} />
              <Text style={styles.reminderOnText}>Daily mood reminder is on</Text>
            </Animated.View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={remindMe}
              style={({ pressed }) => [styles.remind, pressed && { opacity: 0.8 }]}
            >
              <Glyph name="bell" size={16} color={colors.primary} />
              <Text style={styles.remindText}>Remind me each day</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 16, gap: 24 },
  header: { gap: 6 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  sectionTitle: {
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
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
  practice: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  remind: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  remindText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  reminderOn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  reminderOnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
