import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BellIcon, ChevronRightIcon, LifebuoyIcon } from '@/components/icons';
import UserAvatar from '@/features/avatar/components/UserAvatar';
import MoodFace from '@/features/mood/components/MoodFace';
import { useNotifications } from '@/features/notifications/useNotifications';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function RoundButton({
  label,
  hint,
  onPress,
  children,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [styles.round, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      {children}
    </Pressable>
  );
}

export type HeroSession = {
  id: number;
  title: string;
  minutes: number;
  started: boolean;
  done: boolean;
};

export default function HomeHero({ name, session }: { name?: string; session: HeroSession }) {
  const insets = useSafeAreaInsets();
  const { unread } = useNotifications();
  const action = session.done
    ? 'Review Session'
    : session.started
      ? 'Continue Session'
      : 'Start Session';

  return (
    <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="homeHero" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#CFEBDD" />
            <Stop offset="1" stopColor={colors.mint} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#homeHero)" />
      </Svg>

      {/* Faint mood faces behind the greeting, echoing what the page is about. */}
      <View style={styles.decor} pointerEvents="none" accessibilityElementsHidden>
        <View style={[styles.decorFace, { top: 18, right: 64 }]}>
          <MoodFace mood={1} size={74} filled={false} />
        </View>
        <View style={[styles.decorFace, { top: 70, right: -10 }]}>
          <MoodFace mood={4} size={96} filled={false} />
        </View>
        <View style={[styles.decorFace, { top: 128, right: 96 }]}>
          <MoodFace mood={3} size={60} filled={false} />
        </View>
      </View>

      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Your profile and settings"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.identity, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.avatarRing}>
            <UserAvatar size={50} />
          </View>
          <View>
            <Text style={styles.hi}>Hi,</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name || 'there'}
            </Text>
          </View>
        </Pressable>

        <RoundButton
          label="Get help now"
          hint="Opens crisis and support contacts"
          onPress={() => router.push('/support')}
        >
          <LifebuoyIcon size={20} color={colors.danger} />
        </RoundButton>
        <RoundButton
          label={unread ? `Notifications, ${unread} new` : 'Notifications'}
          onPress={() => router.push('/notifications')}
        >
          <BellIcon size={21} color={colors.ink} />
          {unread > 0 && <View style={styles.dot} />}
        </RoundButton>
      </View>

      <Text style={styles.greeting}>{greeting(new Date())}</Text>
      <Text style={styles.headline} accessibilityRole="header">
        Welcome back, how’s your mind today?
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${action} ${session.id}: ${session.title}, about ${session.minutes} minutes`}
        onPress={() => {
          haptics.tap();
          router.push(`/session/${session.id}`);
        }}
        style={({ pressed }) => [styles.start, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <View style={styles.startText}>
          <Text style={styles.startTitle}>
            {action} {session.id}
          </Text>
          <Text style={styles.startMeta} numberOfLines={1}>
            {session.title} · {session.minutes} min
          </Text>
        </View>
        <View style={styles.startArrow}>
          <ChevronRightIcon size={18} color={colors.ink} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decor: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  decorFace: { position: 'absolute', opacity: 0.13 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: { padding: 2, borderRadius: 30, backgroundColor: colors.surface },
  hi: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  name: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.danger,
  },
  greeting: { marginTop: 24, fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  headline: {
    marginTop: 6,
    maxWidth: 300,
    fontFamily: fonts.heavy,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  start: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  startText: { flex: 1, gap: 2 },
  startTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  startMeta: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  startArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
