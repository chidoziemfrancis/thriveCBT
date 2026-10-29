import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

const EDGE = 4;

export default function Button({
  children,
  onPress,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
}) {
  if (variant === 'ghost') {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={haptics.tick}
        disabled={disabled}
        style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.ghostLabel}>{children}</Text>
      </Pressable>
    );
  }

  const isPrimary = variant === 'primary';
  const face = isPrimary ? colors.primary : colors.surface;
  const edge = isPrimary ? colors.primaryEdge : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      onPressIn={haptics.tap}
      disabled={disabled}
      style={[styles.base, { backgroundColor: edge }, disabled && styles.disabled]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            { backgroundColor: face, transform: [{ translateY: pressed ? 0 : -EDGE }] },
            !isPrimary && styles.secondaryFace,
          ]}
        >
          <Text style={[styles.label, { color: isPrimary ? colors.onPrimary : colors.ink }]}>
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, marginTop: EDGE },
  face: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  secondaryFace: { borderWidth: 2, borderColor: colors.border },
  label: { fontFamily: fonts.heavy, fontSize: 17 },
  disabled: { opacity: 0.4 },
  ghost: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ghostLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
});
