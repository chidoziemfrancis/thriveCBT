import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon, LifebuoyIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { REPLY_HOURS } from '@/features/chat/chatLogic';
import { checkInPhase, countdownLabel, whenLabel } from '@/features/checkin/checkinLogic';
import { getNextCheckIn } from '@/features/checkin/checkinStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const PHOTO = 96;

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function MyResearcherScreen() {
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => setNow(new Date()), []));

  const researcher = MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId);

  if (!researcher) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>
          You’ll see your researcher here once you’re matched.
        </Text>
      </Screen>
    );
  }

  const name = firstName(researcher.name);
  const checkIn = getNextCheckIn(researcher.id, now);
  const joinable = checkIn !== null && checkInPhase(checkIn, now) === 'joinable';

  return (
    <Screen>
      <BackButton />

      <View style={styles.who}>
        <View style={styles.photo}>
          <ResearcherPhoto researcher={researcher} initialsStyle={styles.initials} />
        </View>
        <Text style={styles.name}>{researcher.name}</Text>
        <Text style={styles.title}>{researcher.title}</Text>
        <Text style={styles.reply}>{REPLY_HOURS}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button onPress={() => router.push('/chat')}>Message</Button>
        </View>
        <View style={styles.action}>
          <Button
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/chat', params: { draft: 'Can we move our check-in?' } })
            }
          >
            Move check-in
          </Button>
        </View>
      </View>

      <SectionTitle>Next check-in</SectionTitle>
      <Pressable
        accessibilityRole={joinable ? 'button' : undefined}
        disabled={!joinable}
        onPress={() => {
          haptics.tap();
          router.push('/call/lobby');
        }}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
      >
        <View style={styles.icon}>
          <Glyph name="video" size={18} color={colors.primary} />
        </View>
        {checkIn ? (
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{whenLabel(checkIn.startsAt)}</Text>
            <Text style={[styles.rowMeta, joinable && styles.live]}>
              Video call · {countdownLabel(checkIn.startsAt, now)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.rowMeta, styles.rowText]}>
            {name} will message you to book a time.
          </Text>
        )}
        {joinable && <Text style={styles.join}>Join</Text>}
      </Pressable>

      <SectionTitle>About</SectionTitle>
      <Text style={styles.bio}>{researcher.bio}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptics.tick();
          router.push('/support');
        }}
        style={({ pressed }) => [styles.row, styles.help, pressed && { opacity: 0.6 }]}
      >
        <View style={[styles.icon, styles.helpIcon]}>
          <LifebuoyIcon size={18} color={colors.danger} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Get help now</Text>
          <Text style={styles.rowMeta}>If you need support before {name} can reply</Text>
        </View>
        <ChevronRightIcon size={16} color={colors.inkFaint} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  who: { alignItems: 'center', gap: 2, marginTop: 8 },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.lavender,
  },
  initials: { fontFamily: fonts.heavy, fontSize: 32, color: colors.lavenderInk },
  name: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink },
  title: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  reply: { marginTop: 4, fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  action: { flex: 1 },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 2,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  rowMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  live: { fontFamily: fonts.bold, color: colors.primary },
  join: {
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.onPrimary,
    backgroundColor: colors.primary,
  },
  bio: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  help: { marginTop: 28, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  helpIcon: { backgroundColor: colors.dangerSoft },
});
