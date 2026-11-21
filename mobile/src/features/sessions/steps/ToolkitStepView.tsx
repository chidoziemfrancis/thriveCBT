import { StyleSheet, Text, View } from 'react-native';

import { COPING_CARDS, COPING_GROUPS } from '@/features/coping/coping';
import CopingCardRow from '@/features/coping/components/CopingCardRow';
import type { ToolkitStep } from '@/features/sessions/content/types';
import { colors, fonts } from '@/theme';

import { stepText } from './stepText';

export default function ToolkitStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ToolkitStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
        <Text style={styles.count}>
          {answer.length === 0 ? 'Nothing saved yet' : `${answer.length} saved to your toolkit`}
        </Text>
      </View>
      {COPING_GROUPS.map((group) => (
        <View key={group.id}>
          <Text style={styles.group}>{group.label}</Text>
          {COPING_CARDS.filter((c) => c.group === group.id).map((card, i) => (
            <View key={card.id} style={i > 0 && styles.divider}>
              <CopingCardRow
                card={card}
                saved={answer.includes(card.id)}
                onToggle={() =>
                  onAnswer(
                    answer.includes(card.id)
                      ? answer.filter((id) => id !== card.id)
                      : [...answer, card.id]
                  )
                }
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 8 },
  count: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  group: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
