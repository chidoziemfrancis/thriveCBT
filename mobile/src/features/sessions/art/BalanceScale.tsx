import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

const WIDTH = 260;
const MAX_TILT = 16;

/** Tips toward whichever side has more evidence. */
export default function BalanceScale({
  left,
  right,
  leftLabel,
  rightLabel,
}: {
  left: number;
  right: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const tilt = useSharedValue(0);
  useEffect(() => {
    const diff = Math.max(-3, Math.min(3, left - right));
    tilt.set(withSpring((diff / 3) * MAX_TILT, { damping: 12, stiffness: 120 }));
  }, [left, right, tilt]);

  const beam = useAnimatedStyle(() => ({ transform: [{ rotate: `${-tilt.value}deg` }] }));
  // Pans hang straight down, so they move opposite to the beam's rotation.
  const leftPan = useAnimatedStyle(() => ({
    transform: [{ translateY: (tilt.value / MAX_TILT) * 22 }, { rotate: `${tilt.value}deg` }],
  }));
  const rightPan = useAnimatedStyle(() => ({
    transform: [{ translateY: (-tilt.value / MAX_TILT) * 22 }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <View
      style={styles.stage}
      accessible
      accessibilityLabel={`${leftLabel} ${left}, ${rightLabel} ${right}`}
    >
      <Svg width={40} height={120} viewBox="0 0 40 120" style={styles.post}>
        <Path
          d="M20 10 V110 M4 112 H36"
          stroke={colors.ink}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </Svg>
      <Animated.View style={[styles.beam, beam]}>
        <View style={styles.bar} />
        <Animated.View style={[styles.pan, styles.panLeft, leftPan]}>
          <Text style={styles.count}>{left}</Text>
          <Text style={styles.label}>{leftLabel}</Text>
        </Animated.View>
        <Animated.View style={[styles.pan, styles.panRight, rightPan]}>
          <Text style={styles.count}>{right}</Text>
          <Text style={styles.label}>{rightLabel}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const PAN = 92;

const styles = StyleSheet.create({
  stage: { height: 150, alignItems: 'center', justifyContent: 'flex-start' },
  post: { position: 'absolute', top: 24 },
  beam: { width: WIDTH, height: 30, marginTop: 24, alignItems: 'center' },
  bar: { width: WIDTH, height: 6, borderRadius: 3, backgroundColor: colors.ink },
  pan: {
    position: 'absolute',
    top: 10,
    width: PAN,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: PAN / 2,
    borderBottomRightRadius: PAN / 2,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.butter,
  },
  panLeft: { left: -PAN / 2 + 10 },
  panRight: { right: -PAN / 2 + 10, backgroundColor: colors.primarySoft },
  count: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  label: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkMuted },
});
