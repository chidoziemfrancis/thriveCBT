import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

export default function TextField({
  label,
  style,
  ...inputProps
}: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.inkFaint}
        accessibilityLabel={label}
        {...inputProps}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.focused, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
  input: {
    height: 58,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.ink,
  },
  focused: { borderColor: colors.primary },
});
