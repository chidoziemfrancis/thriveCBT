import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CameraIcon, ChatIcon } from '@/components/icons';
import Icon3D from '@/components/icons/Icon3D';
import { Researcher, firstName, initials } from '@/features/assignment/assign';
import { useChat } from '@/features/chat/chatStore';
import {
  CheckIn,
  JOIN_EARLY_MIN,
  checkInPhase,
  countdownLabel,
  whenLabel,
} from '@/features/checkin/checkinLogic';
import { getNextCheckIn } from '@/features/checkin/checkinStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const TICK_MS = 30_000;

/** Re-renders on an interval so countdowns and the Join window stay current. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function CheckInCard({ researcher }: { researcher: Researcher | undefined }) {
  const { unread } = useChat();
  const now = useNow();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);

  // Reloaded on focus so the card moves to next week's slot after a call ends.
  useFocusEffect(
    useCallback(() => {
      setCheckIn(getNextCheckIn(researcher?.id));
    }, [researcher?.id])
  );

  if (!researcher) {
    return (
      <View style={styles.card}>
        <View style={styles.top}>
          <Icon3D name="videoCamera" size={40} />
          <View style={styles.text}>
            <Text style={styles.title}>Weekly check-in</Text>
            <Text style={styles.meta}>
              We’re matching you with a researcher. Your check-ins will appear here.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const name = firstName(researcher.name);
  const joinable = checkIn !== null && checkInPhase(checkIn, now) === 'joinable';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(researcher.name)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Weekly check-in with {name}</Text>
          {checkIn ? (
            <Text style={styles.meta}>
              {whenLabel(checkIn.startsAt)} ·{' '}
              <Text style={joinable && styles.live}>{countdownLabel(checkIn.startsAt, now)}</Text>
            </Text>
          ) : (
            <Text style={styles.meta}>{name} will message you to book a time.</Text>
          )}
        </View>
        <Icon3D name="videoCamera" size={34} />
      </View>

      <View style={styles.actions}>
        {checkIn && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !joinable }}
            accessibilityHint={joinable ? undefined : `Opens ${JOIN_EARLY_MIN} minutes before`}
            disabled={!joinable}
            onPress={() => {
              haptics.tap();
              router.push('/call/lobby');
            }}
            style={({ pressed }) => [
              styles.action,
              styles.join,
              !joinable && styles.joinLocked,
              pressed && { opacity: 0.8 },
            ]}
          >
            <CameraIcon size={18} color={joinable ? colors.onPrimary : colors.inkFaint} />
            <Text style={[styles.joinText, !joinable && { color: colors.inkFaint }]}>
              {joinable ? 'Join call' : `Opens ${JOIN_EARLY_MIN} min before`}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread ? `Message ${name}, ${unread} unread` : `Message ${name}`}
          onPress={() => router.push('/chat')}
          style={({ pressed }) => [styles.action, styles.message, pressed && { opacity: 0.7 }]}
        >
          <ChatIcon size={18} color={colors.primary} />
          <Text style={styles.messageText}>Message</Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Development builds only, so the call flow can be tried without waiting for a slot. */}
      {__DEV__ && checkIn && !joinable && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/call/lobby')}
          style={styles.devLink}
          hitSlop={8}
        >
          <Text style={styles.devLinkText}>Try a test call (dev only)</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 17, color: colors.lavenderInk },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  live: { fontFamily: fonts.bold, color: colors.primary },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  join: { flex: 1.4, backgroundColor: colors.primary },
  joinLocked: { backgroundColor: colors.surfaceMuted },
  joinText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  message: { flex: 1, backgroundColor: colors.primarySoft },
  messageText: { fontFamily: fonts.bold, fontSize: 15, color: colors.mintInk },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.onPrimary },
  devLink: { alignSelf: 'center' },
  devLinkText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkMuted,
    textDecorationLine: 'underline',
  },
});
