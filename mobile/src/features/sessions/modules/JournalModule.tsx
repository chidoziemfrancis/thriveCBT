import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import Emoji from '@/components/icons/Emoji';
import Button from '@/components/ui/Button';
import { colors, fonts, radius, type } from '@/theme';

const MAX_LENGTH = 2000;

export default function JournalModule({
  prompt,
  hint,
  onComplete,
}: {
  prompt: string;
  hint: string;
  onComplete: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const canSave = text.trim().length > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Emoji name="memo" size={56} />
        <Text style={[type.title, styles.prompt]}>{prompt}</Text>
      </View>
      <Text style={type.body}>{hint}</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Start writing…"
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        accessibilityLabel={prompt}
        style={[styles.input, focused && styles.inputFocused]}
      />
      <Text style={styles.count}>
        {text.length} / {MAX_LENGTH}
      </Text>

      <Button disabled={!canSave} onPress={() => onComplete(text.trim())}>
        Save to my journal
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  prompt: { flex: 1 },
  input: {
    minHeight: 200,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.primary },
  count: { alignSelf: 'flex-end', fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
