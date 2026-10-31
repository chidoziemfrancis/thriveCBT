import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { SUPPORT_OPTIONS } from '@/features/support/supportOptions';
import { colors, fonts, radius, type } from '@/theme';

export default function SupportScreen() {
  return (
    <Screen footer={<Button onPress={() => router.back()}>Back to home</Button>}>
      <View style={styles.body}>
        <View style={styles.center}>
          <Mascot size={96} mood="calm" />
        </View>
        <Text style={[type.title, styles.centerText]}>You don’t have to do this alone</Text>

        <View style={styles.urgent} accessibilityRole="alert">
          <Text style={styles.urgentText}>
            If you’re in immediate danger or might act on thoughts of hurting yourself, call your
            local emergency number now.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>You can also reach out to:</Text>
          {SUPPORT_OPTIONS.map(({ label, Icon }) => (
            <View key={label} style={styles.row}>
              <View style={styles.icon}>
                <Icon size={18} color={colors.danger} />
              </View>
              <Text style={styles.label}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 12, gap: 18 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  urgent: { padding: 16, borderRadius: radius.md, backgroundColor: colors.dangerSoft },
  urgentText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.danger },
  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
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
