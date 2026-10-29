import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import Emoji from '@/components/icons/Emoji';
import {
  moodToRotation,
  pointOnArc,
  rotationToMood,
  sweepPerMood,
  touchToRotation,
} from '@/features/mood/gauge';
import { MOODS } from '@/features/mood/moods';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

const STROKE = 34;
const GAP_DEGREES = 2;
const FACE = 26;
const SPRING = { damping: 14, stiffness: 160 };

function arcPath(cx: number, cy: number, radius: number, from: number, to: number) {
  const start = pointOnArc(cx, cy, radius, from);
  const end = pointOnArc(cx, cy, radius, to);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}

export default function MoodGauge({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (mood: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const rotation = useSharedValue(90);
  const dragging = useRef(false);

  const count = MOODS.length;
  const sweep = sweepPerMood(count);
  const radius = Math.max(width / 2 - STROKE / 2 - 4, 0);
  const cx = width / 2;
  const cy = radius + STROKE / 2 + 4;
  const needle = radius - STROKE / 2 - 10;

  // Snap the needle to the chosen mood unless a finger is moving it right now.
  useEffect(() => {
    if (!dragging.current && value !== null) {
      rotation.set(withSpring(moodToRotation(value, count), SPRING));
    }
  }, [value, count, rotation]);

  function follow(x: number, y: number) {
    const next = touchToRotation(x - cx, cy - y);
    rotation.set(next);
    const mood = rotationToMood(next, count);
    if (mood !== value) {
      haptics.tick();
      onChange(mood);
    }
  }

  const pan = usePanGesture({
    runOnJS: true,
    minDistance: 0,
    onBegin: (event) => {
      dragging.current = true;
      follow(event.x, event.y);
    },
    onUpdate: (event) => follow(event.x, event.y),
    onFinalize: () => {
      dragging.current = false;
      const mood = rotationToMood(rotation.get(), count);
      rotation.set(withSpring(moodToRotation(mood, count), SPRING));
    },
  });

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const mood = value !== null ? MOODS[value] : null;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="How are you feeling today"
      accessibilityValue={{ text: mood?.label ?? 'Not chosen' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        const current = value ?? Math.floor(count / 2);
        const next = nativeEvent.actionName === 'increment' ? current + 1 : current - 1;
        onChange(Math.min(Math.max(next, 0), count - 1));
      }}
    >
      <GestureDetector gesture={pan}>
        <View
          style={[styles.gauge, { height: cy + 12 }]}
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        >
          {width > 0 && (
            <>
              <Svg width={width} height={cy + 12} pointerEvents="none">
                {MOODS.map((m, i) => (
                  <Path
                    key={m.label}
                    d={arcPath(
                      cx,
                      cy,
                      radius,
                      i * sweep + GAP_DEGREES / 2,
                      (i + 1) * sweep - GAP_DEGREES / 2
                    )}
                    stroke={m.color}
                    strokeWidth={STROKE}
                    strokeOpacity={value === null || value === i ? 1 : 0.45}
                    fill="none"
                  />
                ))}
              </Svg>

              {MOODS.map((m, i) => {
                const point = pointOnArc(cx, cy, radius, moodToRotation(i, count));
                return (
                  <View
                    key={m.label}
                    pointerEvents="none"
                    style={[styles.face, { left: point.x - FACE / 2, top: point.y - FACE / 2 }]}
                  >
                    <Emoji name={m.emoji} size={FACE} />
                  </View>
                );
              })}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.needleBox,
                  {
                    left: cx - needle,
                    top: cy - needle,
                    width: needle * 2,
                    height: needle * 2,
                    opacity: value === null ? 0.35 : 1,
                  },
                  needleStyle,
                ]}
              >
                <Svg width={needle * 2} height={needle * 2}>
                  <Line
                    x1={needle}
                    y1={needle}
                    x2={14}
                    y2={needle}
                    stroke={colors.ink}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <Circle cx={needle} cy={needle} r={11} fill={colors.ink} />
                  <Circle cx={needle} cy={needle} r={4} fill={colors.surface} />
                </Svg>
              </Animated.View>
            </>
          )}
        </View>
      </GestureDetector>

      <Animated.View key={value ?? 'none'} entering={FadeIn.duration(200)} style={styles.readout}>
        {mood ? (
          <>
            <Emoji name={mood.emoji} size={30} />
            <Text style={styles.label}>{mood.label}</Text>
          </>
        ) : (
          <Text style={styles.hint}>Drag the needle or tap a colour</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: { width: '100%' },
  face: { position: 'absolute' },
  needleBox: { position: 'absolute' },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 34,
    marginTop: 4,
  },
  label: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  hint: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
});
