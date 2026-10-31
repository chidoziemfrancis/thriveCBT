import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import FeatureIcon from '@/components/icons/FeatureIcon';
import { ChevronRightIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import {
  getLastSeenNotifications,
  markNotificationsSeen,
  useNotifications,
} from '@/features/notifications/useNotifications';
import { colors, fonts, radius, type } from '@/theme';

function timeAgo(iso: string, now: Date) {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default function NotificationsScreen() {
  const { items } = useNotifications();
  // Captured before this visit marks everything seen, so new items stay highlighted meanwhile.
  const [{ seenBefore, now }] = useState(() => ({
    seenBefore: readSeenBefore(items),
    now: new Date(),
  }));

  useFocusEffect(
    useCallback(() => {
      markNotificationsSeen();
    }, [])
  );

  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.title]}>Notifications</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <FeatureIcon name="sun" size={80} tone="butter" />
          <Text style={[type.body, styles.center]}>You’re all caught up.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => {
            const isNew = !seenBefore.has(item.id);
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(40 * index).duration(300)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isNew ? 'New. ' : ''}${item.title}. ${item.body}`}
                  onPress={() => router.push(item.href as Href)}
                  style={({ pressed }) => [
                    styles.row,
                    isNew && styles.rowNew,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <FeatureIcon name={item.icon} size={44} />
                  <View style={styles.text}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowBody}>{item.body}</Text>
                    <Text style={styles.time}>{timeAgo(item.at, now)}</Text>
                  </View>
                  {isNew && <View style={styles.dot} />}
                  <ChevronRightIcon color={colors.inkFaint} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function readSeenBefore(items: { id: string; at: string }[]): Set<string> {
  const lastSeen = getLastSeenNotifications();
  const since = lastSeen ? new Date(lastSeen).getTime() : 0;
  return new Set(items.filter((i) => new Date(i.at).getTime() <= since).map((i) => i.id));
}

const styles = StyleSheet.create({
  title: { marginTop: 18, marginBottom: 16 },
  center: { textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowNew: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  text: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  rowBody: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19, color: colors.inkMuted },
  time: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
