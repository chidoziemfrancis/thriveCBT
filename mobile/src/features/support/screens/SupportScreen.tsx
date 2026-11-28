import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { useCrisisPlan } from '@/features/coping/store/copingStore';
import { SUPPORT_OPTIONS } from '@/features/support/supportOptions';
import { useWellPlan } from '@/features/wellbeing/store/wellPlanStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

export default function SupportScreen() {
  const plan = useCrisisPlan();
  const wellPlan = useWellPlan();
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

        <View>
          {[
            {
              title: 'My crisis plan',
              meta: plan ? 'Your steps for the hardest moments' : 'Make a plan in six short steps',
              icon: 'shield' as const,
              href: '/crisis-plan' as const,
            },
            ...(wellPlan
              ? [
                  {
                    title: 'My staying-well plan',
                    meta: 'Warning signs, what to do, who to tell',
                    icon: 'flag' as const,
                    href: '/staying-well' as const,
                  },
                ]
              : []),
            {
              title: 'Relax',
              meta: 'Breathing, muscle relaxation, grounding',
              icon: 'sun' as const,
              href: '/relax' as const,
            },
          ].map((row, i) => (
            <Pressable
              key={row.title}
              accessibilityRole="button"
              onPress={() => {
                haptics.tick();
                router.push(row.href);
              }}
              style={({ pressed }) => [
                styles.link,
                i > 0 && styles.linkNext,
                pressed && { opacity: 0.6 },
              ]}
            >
              <FeatureIcon name={row.icon} size={40} tone="lavender" />
              <View style={styles.linkText}>
                <Text style={styles.label}>{row.title}</Text>
                <Text style={styles.linkMeta}>{row.meta}</Text>
              </View>
              <ChevronRightIcon size={16} color={colors.inkFaint} />
            </Pressable>
          ))}
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
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  linkNext: { borderTopWidth: 0 },
  linkText: { flex: 1, gap: 2 },
  linkMeta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
