import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import type { Researcher } from '@/features/assignment/assign';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import MoodFace from '@/features/mood/components/MoodFace';
import { logMood } from '@/features/mood/moodStore';
import { MOODS } from '@/features/mood/moods';
import type { AppNotification } from '@/features/notifications/buildNotifications';
import {
  getLastSeenNotifications,
  markNotificationsSeen,
  useNotifications,
} from '@/features/notifications/useNotifications';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const ICON = 40;

function timeAgo(iso: string, now: Date) {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days`;
}

function Lead({ item, researcher }: { item: AppNotification; researcher?: Researcher }) {
  if (item.kind === 'chat') {
    return (
      <View style={[styles.lead, styles.photo]}>
        <ResearcherPhoto researcher={researcher} initialsStyle={styles.initials} />
      </View>
    );
  }
  return (
    <View style={styles.lead}>
      <Glyph name={item.icon} size={20} color={colors.primary} />
    </View>
  );
}

function MoodFaces({ onLog }: { onLog: (mood: number) => void }) {
  return (
    <View style={styles.faces} accessibilityRole="radiogroup">
      {MOODS.map((mood, i) => (
        <Pressable
          key={mood.label}
          accessibilityRole="radio"
          accessibilityLabel={`Log mood: ${mood.label}`}
          accessibilityState={{ selected: false }}
          hitSlop={4}
          onPress={() => onLog(i)}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.9 }] }}
        >
          <MoodFace mood={i} size={34} />
        </Pressable>
      ))}
    </View>
  );
}

function Row({
  item,
  isNew,
  first,
  now,
  researcher,
  onLogMood,
}: {
  item: AppNotification;
  isNew: boolean;
  first: boolean;
  now: Date;
  researcher?: Researcher;
  onLogMood: (mood: number) => void;
}) {
  const mood = item.kind === 'mood';
  const open = () => {
    haptics.tick();
    router.push(item.href as Href);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.duration(220)}
    >
      <Pressable
        accessibilityRole={mood ? undefined : 'button'}
        accessibilityLabel={mood ? undefined : `${isNew ? 'New. ' : ''}${item.title}. ${item.body}`}
        disabled={mood}
        onPress={open}
        style={({ pressed }) => [styles.row, !first && styles.divider, pressed && { opacity: 0.6 }]}
      >
        <View style={styles.dotSlot}>{isNew && <View style={styles.dot} />}</View>
        <Lead item={item} researcher={researcher} />
        <View style={styles.text}>
          <View style={styles.titleLine}>
            <Text style={[styles.title, isNew && styles.titleNew]}>{item.title}</Text>
            {!item.todo && <Text style={styles.time}>{timeAgo(item.at, now)}</Text>}
          </View>
          {mood ? <MoodFaces onLog={onLogMood} /> : <Text style={styles.body}>{item.body}</Text>}
        </View>
        {item.action && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.action}: ${item.title}`}
            onPress={open}
            hitSlop={6}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.actionText}>{item.action}</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const { items, researcher, refresh } = useNotifications();
  // Captured before this visit marks everything seen, so new items keep their dot meanwhile.
  const [{ seenBefore, now }] = useState(() => ({
    seenBefore: readSeenBefore(items),
    now: new Date(),
  }));

  useFocusEffect(
    useCallback(() => {
      markNotificationsSeen();
    }, [])
  );

  function handleLogMood(mood: number) {
    logMood(mood);
    haptics.success();
    refresh();
  }

  const todo = items.filter((i) => i.todo);
  const fresh = items.filter((i) => !i.todo && !seenBefore.has(i.id));
  const earlier = items.filter((i) => !i.todo && seenBefore.has(i.id));

  const rows = (list: AppNotification[]) =>
    list.map((item, i) => (
      <Row
        key={item.id}
        item={item}
        isNew={!seenBefore.has(item.id)}
        first={i === 0}
        now={now}
        researcher={researcher}
        onLogMood={handleLogMood}
      />
    ));

  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.heading]}>Notifications</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Glyph name="sun" size={28} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>You’re all caught up</Text>
          <Text style={styles.emptyBody}>New messages and reminders will show here.</Text>
        </View>
      ) : (
        <>
          {todo.length > 0 && <Section title="To do">{rows(todo)}</Section>}
          {fresh.length > 0 && <Section title="New">{rows(fresh)}</Section>}
          {earlier.length > 0 && <Section title="Earlier">{rows(earlier)}</Section>}
        </>
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
  heading: { marginTop: 18 },
  section: { marginTop: 24 },
  sectionTitle: {
    marginBottom: 2,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  dotSlot: { width: 8, marginRight: -6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  lead: {
    width: ICON,
    height: ICON,
    borderRadius: ICON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  photo: { overflow: 'hidden', backgroundColor: colors.lavender },
  initials: { fontFamily: fonts.heavy, fontSize: 15, color: colors.lavenderInk },
  text: { flex: 1, gap: 3 },
  titleLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  titleNew: { fontFamily: fonts.bold },
  time: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  body: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  faces: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, maxWidth: 240 },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onPrimary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  emptyBody: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
});
