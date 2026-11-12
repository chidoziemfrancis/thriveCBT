import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

const KNOB = 30;
const STEP = 10;

/** 0 to 100 in steps of ten; the fill deepens in the given colour as it rises. */
export default function PercentSlider({
  value,
  onChange,
  color,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  color: string;
  label: string;
}) {
  const [width, setWidth] = useState(0);
  const span = Math.max(0, width - KNOB);

  function set(next: number) {
    const clamped = Math.min(100, Math.max(0, Math.round(next / STEP) * STEP));
    if (clamped !== value) {
      haptics.tick();
      onChange(clamped);
    }
  }

  const pan = usePanGesture({
    onBegin: (event) => {
      'worklet';
      if (span > 0) scheduleOnRN(set, ((event.x - KNOB / 2) / span) * 100);
    },
    onUpdate: (event) => {
      'worklet';
      if (span > 0) scheduleOnRN(set, ((event.x - KNOB / 2) / span) * 100);
    },
  });

  return (
    <View style={styles.wrap}>
      <Text style={[styles.value, { color }]}>{value}%</Text>
      <GestureDetector gesture={pan}>
        <View
          style={styles.track}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: 0, max: 100, now: value }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) =>
            set(value + (e.nativeEvent.actionName === 'increment' ? STEP : -STEP))
          }
        >
          <View
            style={[
              styles.fill,
              {
                width: KNOB + (span * value) / 100,
                backgroundColor: color,
                opacity: 0.35 + (value / 100) * 0.65,
              },
            ]}
          />
          <View style={[styles.knob, { left: (span * value) / 100, backgroundColor: color }]} />
        </View>
      </GestureDetector>
      <View style={styles.ends}>
        <Text style={styles.end}>A little</Text>
        <Text style={styles.end}>Very strong</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  value: { fontFamily: fonts.heavy, fontSize: 28, textAlign: 'center' },
  track: {
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
  },
  fill: { position: 'absolute', left: 0, height: KNOB, borderRadius: KNOB / 2 },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
