import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon } from '@/components/icons';
import {
  addJournalEntry,
  clearJournalDraft,
  getJournalDraft,
  getJournalEntry,
  saveJournalDraft,
  updateJournalEntry,
} from '@/features/journal/journalStore';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const MAX_LENGTH = 5000;

type Form = { prompt?: string; text: string; mood?: number };

function initialForm(id: string | undefined, prompt: string | undefined): Form {
  if (id) {
    const entry = getJournalEntry(id);
    return { prompt: entry?.prompt, text: entry?.text ?? '', mood: entry?.mood };
  }
  // With no prompt passed, this is "continue my draft" (or a blank free-writing page).
  if (prompt) return { prompt, text: '' };
  return getJournalDraft() ?? { text: '' };
}

export default function WriteEntryScreen() {
  const { id, prompt } = useLocalSearchParams<{ id?: string; prompt?: string }>();
  const editing = id !== undefined;
  const [original] = useState(() => initialForm(id, prompt));
  const [form, setForm] = useState(original);
  const canSave = form.text.trim().length > 0;
  const changed = form.text !== original.text || form.mood !== original.mood;

  function update(patch: Partial<Form>) {
    const next = { ...form, ...patch };
    setForm(next);
    // Only new entries keep a draft; an edit is either saved or cancelled.
    if (!editing) {
      if (next.text.trim() || next.mood !== undefined) saveJournalDraft(next);
      else clearJournalDraft();
    }
  }

  function save() {
    const text = form.text.trim();
    if (!text) return;
    if (id) {
      updateJournalEntry(id, { text, mood: form.mood });
    } else {
      addJournalEntry({ prompt: form.prompt, text, mood: form.mood });
      clearJournalDraft();
    }
    haptics.success();
    router.back();
  }

  function close() {
    if (!editing || !changed) return router.back();
    Alert.alert('Discard your changes?', 'Your entry will stay as it was before you edited it.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={editing ? 'Cancel editing' : 'Close. Your draft is kept.'}
            onPress={close}
            hitSlop={8}
            style={styles.close}
          >
            <CloseIcon size={16} color={colors.ink} />
          </Pressable>
          <Text style={styles.barTitle}>{editing ? 'Edit entry' : 'New entry'}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            disabled={!canSave}
            onPress={save}
            style={[styles.save, !canSave && styles.saveDisabled]}
          >
            <Text style={[styles.saveText, !canSave && { color: colors.inkFaint }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {form.prompt && (
            <View style={styles.promptBox}>
              <Text style={styles.eyebrow}>Prompt</Text>
              <Text style={styles.prompt}>{form.prompt}</Text>
            </View>
          )}

          <View style={styles.moodBlock}>
            <Text style={styles.moodLabel}>How are you feeling? (optional)</Text>
            <View style={styles.moods} accessibilityRole="radiogroup">
              {MOODS.map((mood, i) => {
                const selected = form.mood === i;
                return (
                  <Pressable
                    key={mood.label}
                    accessibilityRole="radio"
                    accessibilityLabel={mood.label}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      haptics.tick();
                      update({ mood: selected ? undefined : i });
                    }}
                    style={styles.moodOption}
                  >
                    <View
                      style={[
                        styles.moodRing,
                        selected && { borderColor: mood.color },
                        form.mood !== undefined && !selected && { opacity: 0.4 },
                      ]}
                    >
                      <MoodFace mood={i} size={38} />
                    </View>
                    <Text style={[styles.moodName, selected && styles.moodNameOn]}>
                      {mood.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextInput
            value={form.text}
            onChangeText={(text) => update({ text })}
            placeholder="Start writing. There are no wrong answers."
            placeholderTextColor={colors.inkFaint}
            multiline
            autoFocus={!editing}
            maxLength={MAX_LENGTH}
            textAlignVertical="top"
            accessibilityLabel={form.prompt ?? 'Journal entry'}
            style={styles.input}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {editing ? 'Editing' : form.text.trim() ? 'Draft saved' : 'Saved as you type'}
          </Text>
          <Text style={styles.footerText}>
            {form.text.length} / {MAX_LENGTH}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  save: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  saveDisabled: { backgroundColor: colors.surfaceMuted },
  saveText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  content: { flexGrow: 1, gap: 20, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  promptBox: { gap: 6, padding: 16, borderRadius: radius.lg, backgroundColor: colors.mint },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mintInk,
  },
  prompt: { fontFamily: fonts.heavy, fontSize: 19, lineHeight: 26, color: colors.ink },
  moodBlock: { gap: 10 },
  moodLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  moodOption: { alignItems: 'center', gap: 4 },
  moodRing: { padding: 3, borderRadius: 26, borderWidth: 2, borderColor: 'transparent' },
  moodName: { fontFamily: fonts.medium, fontSize: 11, color: colors.inkFaint },
  moodNameOn: { fontFamily: fonts.bold, color: colors.ink },
  input: {
    flex: 1,
    minHeight: 240,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  footerText: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
