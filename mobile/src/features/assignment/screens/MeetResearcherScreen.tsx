import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import Emoji from '@/components/icons/Emoji';
import type { EmojiName } from '@/components/icons/emojiSources';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { firstName, initials } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const AVATAR = 112;

export default function MeetResearcherScreen() {
  const assignment = getAssignment();
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId);

  useEffect(() => {
    if (!researcher) return;
    const timer = setTimeout(haptics.heartbeat, 350);
    return () => clearTimeout(timer);
  }, [researcher]);

  if (!researcher) return <Redirect href="/assignment/finding" />;

  const name = firstName(researcher.name);
  const support: { emoji: EmojiName; text: string }[] = [
    { emoji: 'videoCamera', text: 'A short video check-in every week' },
    { emoji: 'speechBalloon', text: `Message ${name} in the app whenever you need` },
    { emoji: 'growingHeart', text: 'Someone looking out for you if things feel heavy' },
  ];

  return (
    <Screen
      footer={<Button onPress={() => router.replace('/auth/create-pin')}>Go to my home</Button>}
    >
      <View style={styles.body}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(researcher.name)}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.header}>
          <Text style={type.eyebrow}>Meet your researcher</Text>
          <Text style={[type.title, styles.center]}>{researcher.name}</Text>
          <Text style={[type.caption, styles.center]}>{researcher.title}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.quote}>
          <Text style={styles.quoteText}>“{researcher.bio}”</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>How {name} will support you</Text>
          {support.map(({ emoji, text }) => (
            <View key={text} style={styles.row}>
              <View style={styles.rowIcon}>
                <Emoji name={emoji} size={26} />
              </View>
              <Text style={styles.rowText}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        <Text style={[type.caption, styles.center]}>
          {name} will message you soon to book your first check-in.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, alignItems: 'center', gap: 18 },
  center: { textAlign: 'center' },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.lavender,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 38, color: colors.lavenderInk },
  header: { alignItems: 'center', gap: 4 },
  quote: {
    alignSelf: 'stretch',
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  quoteText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
});
