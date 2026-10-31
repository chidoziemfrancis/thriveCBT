import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';
import { CheckIcon } from '@/components/icons';

export default function ChoiceButton({
  selected,
  onPress,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.tick();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.label, selected && { color: colors.mintInk }]}>{children}</Text>
      <View style={[styles.dot, selected && styles.dotSelected]}>
        {selected && <CheckIcon size={12} color={colors.onPrimary} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
});
