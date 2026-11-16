import { StyleSheet, Text, View } from 'react-native';

import { SUPPORT_OPTIONS } from '@/features/support/supportOptions';
import { colors, fonts, radius } from '@/theme';

/** Who to reach out to, shown when an answer suggests a student may be at risk. */
export default function SupportCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Please reach out to one of these:</Text>
      {SUPPORT_OPTIONS.map(({ label, Icon }) => (
        <View key={label} style={styles.row}>
          <View style={styles.icon}>
            <Icon size={18} color={colors.danger} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
