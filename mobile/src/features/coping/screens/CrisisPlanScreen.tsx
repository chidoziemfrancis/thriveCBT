import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import CrisisPlanView from '@/features/coping/components/CrisisPlanView';
import { useCrisisPlan } from '@/features/coping/store/copingStore';
import { colors, fonts, radius, type } from '@/theme';

/** The student's own plan for the hardest moments, worked down from step 1. */
export default function CrisisPlanScreen() {
  const plan = useCrisisPlan();

  return (
    <Screen
      footer={
        <Button
          variant={plan ? 'secondary' : 'primary'}
          onPress={() => router.push('/crisis-plan/edit')}
        >
          {plan ? 'Edit my plan' : 'Make my plan'}
        </Button>
      }
    >
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>My crisis plan</Text>
        <Text style={styles.meta}>
          {plan
            ? 'When things feel too much, start at 1 and work down until you feel safer.'
            : 'Six short steps, in your own words, for when things feel too much.'}
        </Text>
      </View>

      <View style={styles.urgent} accessibilityRole="alert">
        <Text style={styles.urgentText}>
          If you might act on thoughts of hurting yourself, call 112 now.
        </Text>
      </View>

      {plan ? (
        <View style={styles.plan}>
          <CrisisPlanView plan={plan} />
        </View>
      ) : (
        <View style={styles.empty}>
          <FeatureIcon name="shield" size={64} tone="lavender" />
          <Text style={styles.emptyBody}>
            It’s private to you. Your researcher only sees that you’ve made one.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  urgent: {
    marginTop: 18,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  urgentText: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.danger },
  plan: { marginTop: 8 },
  empty: { alignItems: 'center', gap: 12, marginTop: 40, paddingHorizontal: 12 },
  emptyBody: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
});
