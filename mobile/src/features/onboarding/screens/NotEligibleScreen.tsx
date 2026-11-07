import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { SUPPORT_OPTIONS } from '@/features/support/supportOptions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

// The research team option only applies to students in the study.
const OPTIONS = SUPPORT_OPTIONS.slice(0, 2);

export default function NotEligibleScreen() {
  return (
    <Screen
      footer={
        <>
          <Button onPress={() => router.dismissAll()}>Back to start</Button>
          <Button variant="ghost" onPress={() => router.back()}>
            Change my answer
          </Button>
        </>
      }
    >
      <View style={styles.body}>
        <Text style={type.title}>This study is for undergraduates</Text>
        <Text style={type.body}>
          Thank you for your interest. Right now ThriveCBT can only include students who are
          studying for their first degree.
        </Text>

        <Text style={styles.sectionTitle}>If you’re struggling, you don’t have to wait</Text>
        <View>
          {OPTIONS.map(({ label, Icon }, i) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => {
                haptics.tick();
                router.push('/support');
              }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.divider,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={styles.icon}>
                <Icon size={18} color={colors.primary} />
              </View>
              <Text style={styles.label}>{label}</Text>
              <ChevronRightIcon size={16} color={colors.inkFaint} />
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 40, gap: 10 },
  sectionTitle: {
    marginTop: 28,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  label: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
