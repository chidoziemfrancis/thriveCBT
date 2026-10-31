import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import FeatureIcon from '@/components/icons/FeatureIcon';
import { PlusIcon, RefreshIcon } from '@/components/icons';
import Screen from '@/components/ui/Screen';
import { daysAgoLabel, excerpt, groupByWeek } from '@/features/journal/journalLogic';
import { JOURNAL_PROMPTS, promptIndexForDay } from '@/features/journal/journalPrompts';
import {
  JournalEntry,
  clearJournalDraft,
  getJournalDraft,
  useJournal,
} from '@/features/journal/journalStore';
import MoodFace from '@/features/mood/components/MoodFace';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

function entryDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function EntryRow({ entry }: { entry: JournalEntry }) {
  const title = entry.prompt ?? 'Free writing';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entryDate(entry.at)}. ${title}. ${excerpt(entry.text, 80)}`}
      onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
      style={({ pressed }) => [styles.entry, pressed && { backgroundColor: colors.surfaceMuted }]}
    >
      {entry.mood !== undefined ? (
        <MoodFace mood={entry.mood} size={36} />
      ) : (
        <FeatureIcon name="pencil" size={36} tone="neutral" />
      )}
      <View style={styles.entryText}>
        <View style={styles.entryMeta}>
          <Text style={styles.entryDate}>{entryDate(entry.at)}</Text>
          {entry.sessionId !== undefined && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Session {entry.sessionId}</Text>
            </View>
          )}
        </View>
        <Text style={styles.entryTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.entryPreview} numberOfLines={2}>
          {excerpt(entry.text)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function JournalScreen() {
  const entries = useJournal();
  const [promptOffset, setPromptOffset] = useState(0);
  const [hasDraft, setHasDraft] = useState(() => getJournalDraft() !== null);

  // The draft is written on the write screen, so check again whenever the tab comes back.
  useFocusEffect(useCallback(() => setHasDraft(getJournalDraft() !== null), []));

  const prompt = JOURNAL_PROMPTS[(promptIndexForDay() + promptOffset) % JOURNAL_PROMPTS.length];
  const groups = groupByWeek(entries);
  const latest = groups[0]?.entries[0];

  function startNew(withPrompt?: string) {
    const open = () =>
      router.push({ pathname: '/entry/write', params: withPrompt ? { prompt: withPrompt } : {} });
    if (!hasDraft) return open();
    // Starting fresh would overwrite the draft, so the student chooses rather than losing it.
    Alert.alert('You have an unfinished entry', 'Pick up where you left off, or start a new one?', [
      { text: 'Continue it', onPress: () => router.push('/entry/write') },
      {
        text: 'Start new',
        style: 'destructive',
        onPress: () => {
          clearJournalDraft();
          setHasDraft(false);
          open();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <Screen insideTabs>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={type.title}>Journal</Text>
          <Text style={styles.meta}>
            {latest
              ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · last written ${daysAgoLabel(latest.at)}`
              : 'A space to think things through'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New entry"
          onPress={() => {
            haptics.tap();
            startNew();
          }}
          style={({ pressed }) => [styles.newButton, pressed && { opacity: 0.85 }]}
        >
          <PlusIcon size={16} color={colors.onPrimary} />
          <Text style={styles.newText}>New</Text>
        </Pressable>
      </View>

      <View style={styles.sections}>
        {hasDraft && (
          <Animated.View entering={FadeIn}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/entry/write')}
              style={({ pressed }) => [styles.draft, pressed && { opacity: 0.85 }]}
            >
              <FeatureIcon name="pencil" size={36} tone="plain" />
              <View style={styles.draftText}>
                <Text style={styles.draftTitle}>Unfinished entry</Text>
                <Text style={styles.draftBody}>Pick up where you left off.</Text>
              </View>
              <Text style={styles.draftAction}>Continue</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(320)} style={styles.promptCard}>
          <Text style={styles.eyebrow}>Today’s prompt</Text>
          <Animated.Text key={prompt} entering={FadeIn.duration(250)} style={styles.prompt}>
            {prompt}
          </Animated.Text>
          <View style={styles.promptActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Write about: ${prompt}`}
              onPress={() => {
                haptics.tap();
                startNew(prompt);
              }}
              style={({ pressed }) => [styles.writeButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.writeText}>Write</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptics.tick();
                setPromptOffset((o) => o + 1);
              }}
              hitSlop={8}
              style={styles.another}
            >
              <RefreshIcon size={15} color={colors.mintInk} />
              <Text style={styles.anotherText}>Another prompt</Text>
            </Pressable>
          </View>
        </Animated.View>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <FeatureIcon name="book" size={72} tone="lavender" />
            <Text style={styles.emptyTitle}>Your journal is empty</Text>
            <Text style={styles.emptyBody}>
              Writing for a few minutes can help untangle a busy mind. Try today’s prompt, or just
              write whatever’s there.
            </Text>
          </View>
        ) : (
          groups.map((group, i) => (
            <Animated.View
              key={group.title}
              entering={FadeInDown.delay(60 * (i + 1)).duration(320)}
              style={styles.group}
            >
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupCard}>
                {group.entries.map((entry, j) => (
                  <View key={entry.id}>
                    {j > 0 && <View style={styles.divider} />}
                    <EntryRow entry={entry} />
                  </View>
                ))}
              </View>
            </Animated.View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, gap: 4 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  newText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  sections: { gap: 16, marginTop: 18 },
  draft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.butter,
  },
  draftText: { flex: 1, gap: 2 },
  draftTitle: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  draftBody: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  draftAction: { fontFamily: fonts.bold, fontSize: 14, color: colors.butterInk },
  promptCard: { gap: 12, padding: 20, borderRadius: radius.lg, backgroundColor: colors.mint },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mintInk,
  },
  prompt: { fontFamily: fonts.heavy, fontSize: 20, lineHeight: 27, color: colors.ink },
  promptActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  writeButton: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  writeText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  another: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anotherText: { fontFamily: fonts.bold, fontSize: 14, color: colors.mintInk },
  group: { gap: 8 },
  groupTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  divider: { height: 1, marginLeft: 66, backgroundColor: colors.surfaceMuted },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  entryText: { flex: 1, gap: 3 },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDate: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.lavender,
  },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.lavenderInk },
  entryTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  entryPreview: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  emptyTitle: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink, marginTop: 6 },
  emptyBody: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 290,
  },
});
