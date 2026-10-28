import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius } from '@/theme';
import BackButton from './BackButton';

export default function StepHeader({
  step,
  totalSteps,
  label = 'Step',
}: {
  step: number;
  totalSteps: number;
  label?: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(step / totalSteps, { duration: 400 });
  }, [progress, step, totalSteps]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.row}>
      <BackButton />
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={styles.count} accessibilityLabel={`${label} ${step} of ${totalSteps}`}>
        {step}/{totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  track: {
    flex: 1,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  count: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted, minWidth: 32, textAlign: 'right' },
});
