import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import MoodFace from '@/features/mood/components/MoodFace';
import type { MoodEntry } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { dailyMoods, moodStreak, mostCommonMood } from '@/features/progress/progressLogic';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
];

const CHART_HEIGHT = 120;
const FACE = 22;

function weekday(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'narrow' });
}

function shortDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function MoodChart({ entries }: { entries: MoodEntry[] }) {
  const [days, setDays] = useState(RANGES[0].days);
  const slots = dailyMoods(entries, days);
  const logged = slots.filter((s) => s.mood !== null).length;
  const common = mostCommonMood(slots);
  const streak = moodStreak(entries);
  const wide = days > 7;

  const summary =
    common === null
      ? `No moods logged in the last ${days} days.`
      : `Mostly ${MOODS[common].label.toLowerCase()} over the last ${days} days. ${logged} of ${days} days logged.`;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Your mood</Text>
        <View style={styles.toggle} accessibilityRole="tablist">
          {RANGES.map((range) => {
            const active = range.days === days;
            return (
              <Pressable
                key={range.days}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  if (active) return;
                  haptics.tick();
                  setDays(range.days);
                }}
                style={[styles.toggleItem, active && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                  {range.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {logged === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyFaces} accessibilityElementsHidden>
            {MOODS.map((mood, i) => (
              <MoodFace key={mood.label} mood={i} size={30} />
            ))}
          </View>
          <Text style={styles.emptyText}>
            Log how you feel on Home and your {wide ? 'month' : 'week'} will fill in here.
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
        <>
          {/* Keyed on the range so the bars replay their entrance when it changes. */}
          <View key={days} style={styles.chart} accessible accessibilityLabel={summary}>
            {slots.map((slot, i) => {
              const height =
                slot.mood === null ? 6 : ((slot.mood + 1) / MOODS.length) * CHART_HEIGHT;
              return (
                <View key={slot.date.getTime()} style={styles.column}>
                  <Animated.View
                    entering={FadeInDown.delay(i * (wide ? 12 : 40)).duration(320)}
                    style={[
                      styles.bar,
                      wide && styles.barThin,
                      { height },
                      slot.mood === null
                        ? styles.barEmpty
                        : { backgroundColor: MOODS[slot.mood].color },
                    ]}
                  >
                    {!wide && slot.mood !== null && (
                      <MoodFace mood={slot.mood} size={FACE} filled={false} />
                    )}
                  </Animated.View>
                </View>
              );
            })}
          </View>

          <View style={styles.axis} accessibilityElementsHidden>
            {wide ? (
              <>
                <Text style={styles.axisText}>{shortDate(slots[0].date)}</Text>
                <Text style={styles.axisText}>Today</Text>
              </>
            ) : (
              slots.map((slot, i) => (
                <Text
                  key={slot.date.getTime()}
                  style={[
                    styles.axisText,
                    styles.axisDay,
                    i === slots.length - 1 && styles.axisToday,
                  ]}
                >
                  {weekday(slot.date)}
                </Text>
              ))
            )}
          </View>

          <View style={styles.facts}>
            {common !== null && (
              <View style={styles.fact}>
                <MoodFace mood={common} size={28} />
                <View>
                  <Text style={styles.factValue}>{MOODS[common].label}</Text>
                  <Text style={styles.factLabel}>Most often</Text>
                </View>
              </View>
            )}
            <View style={styles.fact}>
              <View style={styles.streakDot}>
                <Text style={styles.streakNumber}>{streak}</Text>
              </View>
              <View>
                <Text style={styles.factValue}>{streak === 1 ? '1 day' : `${streak} days`}</Text>
                <Text style={styles.factLabel}>In a row</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  toggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  toggleItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  toggleActive: { backgroundColor: colors.surface },
  toggleText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  toggleTextActive: { color: colors.ink },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT, gap: 2 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '78%',
    minWidth: 4,
    alignItems: 'center',
    paddingTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barThin: { width: '70%', borderRadius: 3, paddingTop: 0 },
  barEmpty: { backgroundColor: colors.surfaceMuted },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  axisText: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  axisDay: { flex: 1, textAlign: 'center' },
  axisToday: { fontFamily: fonts.heavy, color: colors.ink },
  facts: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factValue: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink },
  factLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: { fontFamily: fonts.heavy, fontSize: 13, color: colors.butterInk },
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
