import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LifebuoyIcon } from '@/components/icons';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

export default function HomeHeader({ name, week }: { name?: string; week: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={type.eyebrow}>
          Week {week} of {SESSIONS.length}
        </Text>
        <Text style={styles.greeting} numberOfLines={1}>
          Hi{name ? `, ${name}` : ''}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Get help now"
        accessibilityHint="Opens crisis and support contacts"
        onPress={() => {
          haptics.tap();
          router.push('/support');
        }}
        hitSlop={8}
        style={({ pressed }) => [styles.help, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <LifebuoyIcon size={20} color={colors.danger} />
        <Text style={styles.helpLabel}>Help</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, gap: 2 },
  greeting: { fontFamily: fonts.heavy, fontSize: 30, letterSpacing: -0.6, color: colors.ink },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.dangerSoft,
  },
  helpLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.danger },
});
