import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import WellPlanView from '@/features/wellbeing/components/WellPlanView';
import { toggleGoalStep, useWellPlan } from '@/features/wellbeing/store/wellPlanStore';
import { colors, fonts, type } from '@/theme';

/** The plan from Session 8, for when things start to slip, with the goal's steps to tick off. */
export default function WellPlanScreen() {
  const plan = useWellPlan();
  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>My staying-well plan</Text>
        <Text style={styles.meta}>
          {plan
            ? 'If you notice your warning signs, start here. A lapse is not a relapse.'
            : 'You’ll make this plan in the last session.'}
        </Text>
      </View>
      {plan ? (
        <View style={styles.plan}>
          <WellPlanView plan={plan} onToggleStep={toggleGoalStep} />
        </View>
      ) : (
        <View style={styles.empty}>
          <FeatureIcon name="flag" size={64} tone="mint" />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  plan: { marginTop: 20 },
  empty: { alignItems: 'center', marginTop: 40 },
});
