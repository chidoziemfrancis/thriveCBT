import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import MoodFace from '@/features/mood/components/MoodFace';
import type { MoodEntry } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { dailyMoods, mostCommonMood } from '@/features/progress/progressLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const RANGES = [
  { days: 7, label: 'This week' },
  { days: 30, label: '30 days' },
];

const HEIGHT = 140;
// Room above the top line and below the bottom one so dots and the tooltip aren't clipped.
const PAD_Y = 14;
const TOP_MOOD = MOODS.length - 1;
const TOOLTIP_WIDTH = 92;

type Point = { x: number; y: number; mood: number; date: Date; index: number };

function yFor(mood: number) {
  return PAD_Y + (1 - mood / TOP_MOOD) * (HEIGHT - PAD_Y * 2);
}

// Control points sit halfway across at each end's height, so the curve stays smooth but never
// overshoots above "Great" or below "Awful".
function smoothPath(points: Point[]) {
  return points.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const midX = (prev.x + p.x) / 2;
    return `${d} C${midX},${prev.y} ${midX},${p.y} ${p.x},${p.y}`;
  }, '');
}

function shortDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function shortDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function MoodTrend({ entries }: { entries: MoodEntry[] }) {
  const [days, setDays] = useState(RANGES[0].days);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const slots = dailyMoods(entries, days);
  const step = slots.length > 1 ? width / (slots.length - 1) : 0;
  const points: Point[] = slots.flatMap((slot, index) =>
    slot.mood === null
      ? []
      : [{ x: index * step, y: yFor(slot.mood), mood: slot.mood, date: slot.date, index }]
  );
  const active = points.find((p) => p.index === selected) ?? points[points.length - 1];
  const common = mostCommonMood(slots);

  function pick(locationX: number) {
    if (points.length === 0) return;
    const nearest = points.reduce((best, p) =>
      Math.abs(p.x - locationX) < Math.abs(best.x - locationX) ? p : best
    );
    if (nearest.index !== active?.index) haptics.tick();
    setSelected(nearest.index);
  }

  const summary =
    common === null
      ? `No moods logged in the last ${days} days.`
      : `Mostly ${MOODS[common].label.toLowerCase()} over the last ${days} days, ${points.length} days logged.`;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Mood trend</Text>
        <View style={styles.toggle} accessibilityRole="tablist">
          {RANGES.map((range) => {
            const on = range.days === days;
            return (
              <Pressable
                key={range.days}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  if (on) return;
                  haptics.tick();
                  setDays(range.days);
                  setSelected(null);
                }}
                style={[styles.toggleItem, on && styles.toggleOn]}
              >
                <Text style={[styles.toggleText, on && styles.toggleTextOn]}>{range.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {points.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyFaces} accessibilityElementsHidden>
            {MOODS.map((mood, i) => (
              <MoodFace key={mood.label} mood={i} size={28} />
            ))}
          </View>
          <Text style={styles.emptyText}>
            Log how you feel on Home and your trend will build up here.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/dashboard')}
            hitSlop={8}
          >
            <Text style={styles.link}>Log today’s mood</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.faces} accessibilityElementsHidden>
            {[TOP_MOOD, TOP_MOOD / 2, 0].map((mood) => (
              <View key={mood} style={[styles.faceSlot, { top: yFor(mood) - 9 }]}>
                <MoodFace mood={mood} size={18} />
              </View>
            ))}
          </View>

          <View style={styles.plot}>
            <Pressable
              accessible
              accessibilityLabel={summary}
              accessibilityHint="Tap a point to see that day"
              onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
              onPress={(e) => pick(e.nativeEvent.locationX)}
              style={{ height: HEIGHT }}
            >
              {width > 0 && (
                <Animated.View key={days} entering={FadeIn.duration(350)}>
                  <Svg width={width} height={HEIGHT}>
                    <Defs>
                      <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.primary} stopOpacity={0.22} />
                        <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                      </LinearGradient>
                    </Defs>

                    {[TOP_MOOD, TOP_MOOD / 2, 0].map((mood) => (
                      <Line
                        key={mood}
                        x1={0}
                        x2={width}
                        y1={yFor(mood)}
                        y2={yFor(mood)}
                        stroke={colors.border}
                        strokeDasharray="4 6"
                      />
                    ))}

                    {active && (
                      <Line
                        x1={active.x}
                        x2={active.x}
                        y1={active.y}
                        y2={HEIGHT}
                        stroke={colors.primary}
                        strokeOpacity={0.35}
                        strokeDasharray="3 4"
                      />
                    )}

                    {points.length > 1 && (
                      <>
                        <Path
                          d={`${smoothPath(points)} L${points[points.length - 1].x},${HEIGHT} L${points[0].x},${HEIGHT} Z`}
                          fill="url(#trendFill)"
                        />
                        <Path
                          d={smoothPath(points)}
                          stroke={colors.primary}
                          strokeWidth={3}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </>
                    )}

                    {days <= 7 &&
                      points.map((p) => (
                        <Circle key={p.index} cx={p.x} cy={p.y} r={3.5} fill={colors.primary} />
                      ))}

                    {active && (
                      <Circle
                        cx={active.x}
                        cy={active.y}
                        r={7}
                        fill={colors.primary}
                        stroke={colors.surface}
                        strokeWidth={3}
                      />
                    )}
                  </Svg>
                </Animated.View>
              )}
            </Pressable>

            {active && width > 0 && (
              <View
                pointerEvents="none"
                style={[
                  styles.tooltip,
                  {
                    left: Math.min(
                      Math.max(active.x - TOOLTIP_WIDTH / 2, 0),
                      width - TOOLTIP_WIDTH
                    ),
                    // Flips below the point near the top so it never covers it.
                    top: active.y < 60 ? active.y + 14 : active.y - 58,
                  },
                ]}
              >
                <Text style={styles.tooltipMood}>{MOODS[active.mood].label}</Text>
                <Text style={styles.tooltipDate}>
                  {active.index === slots.length - 1 ? 'Today' : shortDate(active.date)}
                </Text>
              </View>
            )}

            <View style={styles.axis} accessibilityElementsHidden>
              {days <= 7 ? (
                slots.map((slot, i) => (
                  <Text
                    key={slot.date.getTime()}
                    style={[styles.axisText, i === slots.length - 1 && styles.axisToday]}
                  >
                    {shortDay(slot.date)}
                  </Text>
                ))
              ) : (
                <>
                  <Text style={styles.axisText}>{shortDate(slots[0].date)}</Text>
                  <Text style={[styles.axisText, styles.axisToday]}>Today</Text>
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  toggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  toggleItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  toggleOn: { backgroundColor: colors.surface },
  toggleText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
  toggleTextOn: { color: colors.ink },
  body: { flexDirection: 'row', gap: 8 },
  faces: { width: 18, height: HEIGHT },
  faceSlot: { position: 'absolute', left: 0 },
  plot: { flex: 1 },
  tooltip: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  tooltipMood: { fontFamily: fonts.heavy, fontSize: 13, color: colors.onPrimary },
  tooltipDate: { fontFamily: fonts.medium, fontSize: 11, color: colors.border },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  axisText: { fontFamily: fonts.medium, fontSize: 11, color: colors.inkFaint },
  axisToday: { fontFamily: fonts.heavy, color: colors.ink },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  emptyFaces: { flexDirection: 'row', gap: 6, opacity: 0.5 },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
