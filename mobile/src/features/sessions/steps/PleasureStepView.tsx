import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import { activityIcon, readRatings, writeRatings } from '@/features/activities/activities';
import ScoreRow from '@/features/activities/components/ScoreRow';
import type { PleasureStep } from '@/features/sessions/content/types';
import { colors, fonts } from '@/theme';

import { stepText } from './stepText';

/** Each picked activity, rated for how much enjoyment and achievement it would give. */
export default function PleasureStepView({
  step,
  picked,
  answer,
  onAnswer,
}: {
  step: PleasureStep;
  picked: string[];
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const ratings = readRatings(answer);

  function rate(label: string, key: 'enjoy' | 'achieve', value: number) {
    const next = picked.map((l) => {
      const r = ratings.find((x) => x.label === l) ?? { label: l };
      return l === label ? { ...r, [key]: value } : r;
    });
    onAnswer(writeRatings(next));
  }

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>
      {picked.map((label, i) => {
        const r = ratings.find((x) => x.label === label);
        return (
          <View key={label} style={[styles.item, i > 0 && styles.divider]}>
            <View style={styles.head}>
              <FeatureIcon name={activityIcon(label)} size={32} tone="mint" />
              <Text style={styles.label}>{label}</Text>
            </View>
            <ScoreRow
              label="Enjoyment"
              value={r?.enjoy}
              onChange={(v) => rate(label, 'enjoy', v)}
              color={colors.butterInk}
            />
            <ScoreRow
              label="Achievement"
              value={r?.achieve}
              onChange={(v) => rate(label, 'achieve', v)}
              color={colors.mintInk}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  item: { gap: 14 },
  divider: { paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { flex: 1, fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
});
