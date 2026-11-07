import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PlusIcon } from '@/components/icons';
import TextField from '@/components/ui/TextField';
import MoodFace from '@/features/mood/components/MoodFace';
import type { MoodEntry } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { colors, fonts, radius } from '@/theme';

const FACE = 54;

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** One tap logs today's mood; tapping another face changes it. */
export default function DailyMood({
  today,
  onLog,
  onSaveNote,
}: {
  today: MoodEntry | null;
  onLog: (mood: number) => void;
  onSaveNote: (note: string) => void;
}) {
  const chosen = today?.mood ?? null;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startNote() {
    setDraft(today?.note ?? '');
    setEditing(true);
  }

  function saveNote() {
    onSaveNote(draft);
    setEditing(false);
  }

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.title}>Daily mood</Text>
        {today && <Text style={styles.meta}>Logged {timeOf(today.at)}</Text>}
      </View>

      <View style={styles.row} accessibilityRole="radiogroup">
        {MOODS.map((mood, i) => {
          const selected = chosen === i;
          return (
            <Pressable
              key={mood.label}
              accessibilityRole="radio"
              accessibilityLabel={mood.label}
              accessibilityState={{ selected }}
              onPress={() => {
                if (!selected) onLog(i);
              }}
              style={({ pressed }) => [
                styles.option,
                chosen !== null && !selected && styles.faded,
                selected && styles.selected,
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <View style={[styles.ring, selected && { borderColor: mood.color }]}>
                <MoodFace mood={i} size={FACE} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <Animated.Text key={chosen ?? 'none'} entering={FadeIn.duration(250)} style={styles.caption}>
        {chosen === null
          ? 'Tap the face that fits how you feel right now.'
          : `Feeling ${MOODS[chosen].label.toLowerCase()} today. Thanks for checking in.`}
      </Animated.Text>

      {chosen !== null && editing && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.noteEditor}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder="What’s behind this mood?"
            accessibilityLabel="Mood note"
            multiline
            autoFocus
            maxLength={280}
            textAlignVertical="top"
            style={styles.noteInput}
          />
          <View style={styles.noteActions}>
            <Pressable accessibilityRole="button" onPress={() => setEditing(false)} hitSlop={8}>
              <Text style={styles.noteCancel}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={saveNote}
              style={({ pressed }) => [styles.noteSave, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.noteSaveText}>Save</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
      {chosen !== null && !editing && today?.note && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Your note: ${today.note}. Edit`}
          onPress={startNote}
          style={styles.note}
        >
          <Text style={styles.noteText}>“{today.note}”</Text>
          <Text style={styles.link}>Edit</Text>
        </Pressable>
      )}
      {chosen !== null && !editing && !today?.note && (
        <Pressable
          accessibilityRole="button"
          onPress={startNote}
          hitSlop={8}
          style={styles.addNote}
        >
          <PlusIcon size={14} color={colors.primary} />
          <Text style={styles.link}>Add a note</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { alignItems: 'center' },
  faded: { opacity: 0.4 },
  selected: { transform: [{ scale: 1.1 }] },
  ring: { padding: 3, borderRadius: FACE, borderWidth: 3, borderColor: 'transparent' },
  caption: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  addNote: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  note: { gap: 4 },
  noteText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.ink },
  noteEditor: { gap: 10 },
  noteInput: { height: 96, paddingTop: 14, fontSize: 15 },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 18 },
  noteCancel: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
  noteSave: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  noteSaveText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
});
