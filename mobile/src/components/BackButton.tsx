import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { ChevronLeftIcon } from './Icons';

export default function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => router.back()}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}
    >
      <ChevronLeftIcon size={18} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
