import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LifebuoyIcon, SendIcon } from '@/components/icons';
import { colors, fonts, radius } from '@/theme';

const MAX_LENGTH = 1000;

export default function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    onSend(text);
    setText('');
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Not for emergencies. Get help now"
        onPress={() => router.push('/support')}
        style={styles.helpRow}
        hitSlop={6}
      >
        <LifebuoyIcon size={14} color={colors.inkMuted} />
        <Text style={styles.helpText}>
          Not for emergencies. <Text style={styles.helpLink}>Get help now</Text>
        </Text>
      </Pressable>

      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write a message…"
          placeholderTextColor={colors.inkFaint}
          multiline
          maxLength={MAX_LENGTH}
          style={styles.input}
          accessibilityLabel="Message"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.send,
            !canSend && styles.sendDisabled,
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
        >
          <SendIcon color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' },
  helpText: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  helpLink: { fontFamily: fonts.bold, color: colors.danger },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.35 },
});
