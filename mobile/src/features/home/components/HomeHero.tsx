import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BellIcon, LifebuoyIcon } from '@/components/icons';
import UserAvatar from '@/features/avatar/components/UserAvatar';
import MoodFace from '@/features/mood/components/MoodFace';
import { useNotifications } from '@/features/notifications/useNotifications';
import { SESSIONS } from '@/features/sessions/sessions';
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

export default function HomeHero({ name, week }: { name?: string; week: number }) {
  const insets = useSafeAreaInsets();
  const { unread } = useNotifications();

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

      <View style={styles.weekPill}>
        <View style={styles.weekDot} />
        <Text style={styles.weekText}>
          Week {week} of {SESSIONS.length}
        </Text>
      </View>
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
  hi: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  name: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
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
  greeting: { marginTop: 26, fontFamily: fonts.medium, fontSize: 16, color: colors.inkMuted },
  headline: {
    marginTop: 6,
    maxWidth: 330,
    fontFamily: fonts.heavy,
    fontSize: 33,
    lineHeight: 39,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  weekDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  weekText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
