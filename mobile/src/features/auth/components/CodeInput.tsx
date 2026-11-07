import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { RefreshIcon } from '@/components/icons';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

export const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 30;

export default function CodeInput({
  value,
  onChange,
  label = 'Verification code',
}: {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function handleChange(text: string) {
    const next = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (next.length === CODE_LENGTH && value.length < CODE_LENGTH) haptics.success();
    else if (next.length > value.length) haptics.tick();
    onChange(next);
  }

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

  return (
    <View>
      <Pressable
        accessibilityLabel={label}
        onPress={() => inputRef.current?.focus()}
        style={styles.boxes}
      >
        {digits.map((digit, index) => {
          const active = index === Math.min(value.length, CODE_LENGTH - 1);
          return (
            <View
              key={index}
              style={[styles.box, digit && styles.boxFilled, active && styles.boxActive]}
            >
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
      />

      <View style={styles.resend}>
        <Text style={type.caption}>Didn’t get it? Check spam, or</Text>
        <Pressable
          accessibilityRole="button"
          disabled={secondsLeft > 0}
          onPress={() => setSecondsLeft(COOLDOWN_SECONDS)}
          style={[styles.resendButton, secondsLeft > 0 && { opacity: 0.5 }]}
        >
          <Text style={styles.resendLabel}>
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
          </Text>
          <RefreshIcon size={14} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  box: {
    flex: 1,
    aspectRatio: 0.82,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.inkFaint },
  boxActive: { borderColor: colors.primary },
  digit: { fontFamily: fonts.heavy, fontSize: 26, color: colors.ink },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  resend: { marginTop: 12, gap: 10, alignItems: 'flex-start' },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  resendLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
