import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BellIcon, LifebuoyIcon } from '@/components/icons';
import { initials } from '@/features/assignment/assign';
import { useNotifications } from '@/features/notifications/useNotifications';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

function IconButton({
  label,
  hint,
  onPress,
  tint,
  children,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  tint: string;
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
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: tint },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

export default function HomeHeader({ name, week }: { name?: string; week: number }) {
  const { unread } = useNotifications();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your profile and settings"
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.identity, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(name ?? '') || '?'}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.greeting} numberOfLines={1}>
            Welcome{name ? `, ${name}` : ''}
          </Text>
          <Text style={styles.week}>
            Week {week} of {SESSIONS.length}
          </Text>
        </View>
      </Pressable>

      <IconButton
        label="Get help now"
        hint="Opens crisis and support contacts"
        tint={colors.dangerSoft}
        onPress={() => router.push('/support')}
      >
        <LifebuoyIcon size={20} color={colors.danger} />
      </IconButton>

      <IconButton
        label={unread ? `Notifications, ${unread} new` : 'Notifications'}
        tint={colors.surface}
        onPress={() => router.push('/notifications')}
      >
        <BellIcon size={22} color={colors.ink} />
        {unread > 0 && <View style={styles.dot} />}
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 19, color: colors.onPrimary },
  text: { flex: 1 },
  greeting: { fontFamily: fonts.heavy, fontSize: 22, letterSpacing: -0.4, color: colors.ink },
  week: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.danger,
  },
});
