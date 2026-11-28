import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ToolUse } from '@/features/coping/store/copingStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const OPTIONS: { value: ToolUse['helped']; label: string }[] = [
  { value: 0, label: 'Not really' },
  { value: 1, label: 'A bit' },
  { value: 2, label: 'A lot' },
];

/** "Did it help?" in one tap. */
export default function HelpedChoice({ onPick }: { onPick: (helped: ToolUse['helped']) => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.question}>Did it help?</Text>
      <View style={styles.row}>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            onPress={() => {
              haptics.success();
              onPick(o.value);
            }}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text style={styles.label}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, alignSelf: 'stretch' },
  question: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
});
