import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { InfoStep } from '@/features/sessions/content/types';
import { colors } from '@/theme';

import StepArt from './StepArt';
import { stepText } from './stepText';

export default function InfoStepView({ step }: { step: InfoStep }) {
  return (
    <View style={stepText.center}>
      <StepArt icon={step.art} tone={step.tone} />
      <Animated.View entering={FadeInDown.delay(120).duration(360)} style={stepText.block}>
        <Text style={[stepText.title, stepText.centered]}>{step.title}</Text>
        <Text style={[stepText.body, stepText.centered]}>{step.body}</Text>
        {step.bullets && (
          <View style={styles.bullets}>
            {step.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={stepText.body}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bullets: { gap: 8, marginTop: 4, alignSelf: 'stretch' },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9, backgroundColor: colors.primary },
});
