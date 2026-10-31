import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

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

const FACE = 30;
const HEIGHT = 168;
// Faces sit on the line, so leave half a face of room at the top, bottom and both ends.
const PAD_Y = FACE / 2 + 6;
const PAD_X = FACE / 2 + 2;
const TOP_MOOD = MOODS.length - 1;

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

function longDay(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

function shortDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function MoodTrend({ entries }: { entries: MoodEntry[] }) {
  const [days, setDays] = useState(RANGES[0].days);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const week = days <= 7;
  const slots = dailyMoods(entries, days);
  const step = slots.length > 1 ? (width - PAD_X * 2) / (slots.length - 1) : 0;
  const xFor = (index: number) => PAD_X + index * step;
  const points: Point[] = slots.flatMap((slot, index) =>
    slot.mood === null
      ? []
      : [{ x: xFor(index), y: yFor(slot.mood), mood: slot.mood, date: slot.date, index }]
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
        <View>
          <Pressable
            accessible
            accessibilityLabel={summary}
            accessibilityHint="Tap a day to see its mood"
            onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
            onPress={(e) => pick(e.nativeEvent.locationX)}
            style={{ height: HEIGHT }}
          >
            {width > 0 && (
              <Animated.View key={days} entering={FadeIn.duration(350)}>
                <Svg width={width} height={HEIGHT}>
                  {MOODS.map((_, mood) => (
                    <Line
                      key={mood}
                      x1={0}
                      x2={width}
                      y1={yFor(mood)}
                      y2={yFor(mood)}
                      stroke={colors.border}
                      strokeDasharray="3 6"
                    />
                  ))}

                  {points.length > 1 && (
                    <Path
                      d={smoothPath(points)}
                      stroke={colors.primary}
                      strokeOpacity={0.45}
                      strokeWidth={3}
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}

                  {/* Thirty faces would crowd the chart, so the month view uses small dots. */}
                  {!week &&
                    points.map((p) => (
                      <Circle
                        key={p.index}
                        cx={p.x}
                        cy={p.y}
                        r={p.index === active?.index ? 6 : 3.5}
                        fill={MOODS[p.mood].color}
                        stroke={colors.background}
                        strokeWidth={p.index === active?.index ? 2 : 0}
                      />
                    ))}
                </Svg>

                {week &&
                  points.map((p, i) => {
                    const on = p.index === active?.index;
                    return (
                      <Animated.View
                        key={p.index}
                        entering={ZoomIn.delay(60 * i)
                          .springify()
                          .damping(13)}
                        pointerEvents="none"
                        style={[
                          styles.face,
                          { left: p.x - FACE / 2, top: p.y - FACE / 2 },
                          on && styles.faceOn,
                        ]}
                      >
                        <MoodFace mood={p.mood} size={FACE} />
                      </Animated.View>
                    );
                  })}
              </Animated.View>
            )}
          </Pressable>

          {week ? (
            <View style={styles.axis} accessibilityElementsHidden>
              {slots.map((slot, i) => {
                const today = i === slots.length - 1;
                return (
                  <View
                    key={slot.date.getTime()}
                    style={[styles.tick, { left: xFor(i) - TICK_WIDTH / 2 }]}
                  >
                    <View style={[styles.tickDot, today && styles.tickDotToday]} />
                    <Text style={[styles.tickLabel, today && styles.tickLabelToday]}>
                      {shortDay(slot.date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.monthAxis} accessibilityElementsHidden>
              <Text style={styles.tickLabel}>{shortDate(slots[0].date)}</Text>
              <Text style={[styles.tickLabel, styles.tickLabelToday]}>Today</Text>
            </View>
          )}

          {active && (
            <View style={styles.caption}>
              <MoodFace mood={active.mood} size={18} />
              <Text style={styles.captionText}>
                {active.index === slots.length - 1 ? 'Today' : longDay(active.date)}:{' '}
                <Text style={styles.captionMood}>{MOODS[active.mood].label}</Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const TICK_WIDTH = 44;

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
  face: { position: 'absolute', borderRadius: FACE / 2 },
  // The chosen day lifts slightly, so it's clear which one the caption describes.
  faceOn: {
    transform: [{ scale: 1.2 }],
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  axis: { height: 40, marginTop: 4 },
  tick: { position: 'absolute', width: TICK_WIDTH, alignItems: 'center', gap: 8 },
  tickDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.inkFaint },
  tickDotToday: { backgroundColor: colors.primary },
  tickLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  tickLabelToday: { fontFamily: fonts.bold, color: colors.ink },
  monthAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  captionText: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  captionMood: { fontFamily: fonts.bold, color: colors.ink },
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
