import { Pressable, StyleSheet } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

/** Round call button. "off" uses a light face so a muted mic or camera reads at a glance. */
export default function CallControl({
  label,
  onPress,
  off = false,
  danger = false,
  size = 56,
  children,
}: {
  label: string;
  onPress: () => void;
  off?: boolean;
  danger?: boolean;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: off }}
      onPress={() => {
        haptics.tick();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        off && styles.off,
        danger && styles.danger,
        pressed && { transform: [{ scale: 0.92 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  off: { backgroundColor: colors.surface },
  danger: { backgroundColor: colors.danger },
});
