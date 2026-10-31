import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Glyph, TONES } from '@/components/icons/FeatureIcon';
import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';

const SIZE = 168;

/**
 * The picture at the top of a step: a soft tinted blob with a large outline drawing and a few
 * little rays, standing in for a full illustration.
 */
export default function StepArt({
  icon,
  tone = 'mint',
}: {
  icon: FeatureIconName;
  tone?: FeatureIconTone;
}) {
  const { bg, ink } = TONES[tone];
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(13)}
      style={styles.wrap}
      accessibilityElementsHidden
    >
      <View style={[styles.blob, { backgroundColor: bg }]} />
      <View style={[styles.dot, styles.dotA, { backgroundColor: bg }]} />
      <View style={[styles.dot, styles.dotB, { backgroundColor: bg }]} />
      {[-38, 0, 38].map((angle) => (
        <View
          key={angle}
          style={[
            styles.ray,
            { backgroundColor: ink, transform: [{ rotate: `${angle}deg` }, { translateY: -98 }] },
          ]}
        />
      ))}
      <Glyph name={icon} size={84} color={ink} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  blob: {
    position: 'absolute',
    width: SIZE,
    height: SIZE * 0.92,
    borderTopLeftRadius: SIZE * 0.55,
    borderTopRightRadius: SIZE * 0.45,
    borderBottomLeftRadius: SIZE * 0.42,
    borderBottomRightRadius: SIZE * 0.58,
  },
  dot: { position: 'absolute', borderRadius: 99 },
  dotA: { width: 18, height: 18, left: -6, bottom: 22 },
  dotB: { width: 11, height: 11, right: 2, top: 30 },
  ray: { position: 'absolute', width: 3, height: 14, borderRadius: 2, opacity: 0.5 },
});
