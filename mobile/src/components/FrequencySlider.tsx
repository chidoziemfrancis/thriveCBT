import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { stopForPosition } from '@/lib/frequency';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const THUMB = 36;
const TOUCH_HEIGHT = 56;
const SPRING = { damping: 18, stiffness: 240 };

export default function FrequencySlider({
  labels,
  value,
  onChange,
  color,
}: {
  labels: string[];
  value: number | null;
  onChange: (value: number) => void;
  color: string;
}) {
  const stops = labels.length;
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  function select(position: number) {
    const next = stopForPosition(position, width, stops);
    if (next !== value) {
      haptics.tick();
      onChange(next);
    }
  }

  // minDistance 0 makes a plain tap on the track count as an answer, not just a drag.
  const pan = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    onBegin: (event) => select(event.x),
    onUpdate: (event) => select(event.x),
  });

  useEffect(() => {
    if (value !== null && width > 0) {
      x.value = withSpring((value / (stops - 1)) * width, SPRING);
    }
  }, [value, width, stops, x]);

  const fillStyle = useAnimatedStyle(() => ({ width: x.value }));
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const answered = value !== null;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="How often"
      accessibilityValue={{ text: value !== null ? labels[value] : 'Not answered' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        const current = value ?? -1;
        const next =
          nativeEvent.actionName === 'increment'
            ? Math.min(current + 1, stops - 1)
            : Math.max(current - 1, 0);
        if (next !== value) onChange(next);
      }}
    >
      <GestureDetector gesture={pan}>
        <View
          style={styles.touchArea}
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        >
          <View pointerEvents="none" style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                { backgroundColor: color },
                fillStyle,
                !answered && styles.hidden,
              ]}
            />
          </View>

          {labels.map((label, i) => (
            <View
              key={label}
              pointerEvents="none"
              style={[
                styles.tick,
                { left: width > 0 ? (i / (stops - 1)) * width - 4 : 0 },
                value !== null && i <= value && { backgroundColor: colors.surface },
              ]}
            />
          ))}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,
              { borderColor: answered ? color : colors.border },
              thumbStyle,
              !answered && styles.thumbIdle,
            ]}
          >
            <View
              style={[styles.thumbDot, { backgroundColor: answered ? color : colors.border }]}
            />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.ends}>
        <Text style={styles.endLabel}>{labels[0]}</Text>
        <Text style={[styles.endLabel, styles.endRight]}>{labels[stops - 1]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { height: TOUCH_HEIGHT, justifyContent: 'center', marginHorizontal: THUMB / 2 },
  track: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  hidden: { opacity: 0 },
  tick: {
    position: 'absolute',
    top: (TOUCH_HEIGHT - 8) / 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  thumb: {
    position: 'absolute',
    top: (TOUCH_HEIGHT - THUMB) / 2,
    left: -THUMB / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  thumbIdle: { opacity: 0.6 },
  thumbDot: { width: 10, height: 10, borderRadius: 5 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  endLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted, maxWidth: '45%' },
  endRight: { textAlign: 'right' },
});
