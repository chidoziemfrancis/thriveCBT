import { StyleSheet, Text, View } from 'react-native';

import type { VideoStep } from '@/features/sessions/content/types';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

export default function VideoStepView({ step }: { step: VideoStep }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.player} accessibilityLabel={`${step.title}, video coming soon`}>
        <View style={styles.play}>
          <View style={styles.triangle} />
        </View>
        <Text style={styles.soon}>Video coming soon</Text>
      </View>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 24, paddingTop: 16 },
  player: {
    aspectRatio: 16 / 10,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  play: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangle: {
    marginLeft: 5,
    width: 0,
    height: 0,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.onPrimary,
  },
  soon: { fontFamily: fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
});
