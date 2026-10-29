import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  DateParts,
  MONTHS,
  daysInMonth,
  isFutureDate,
  leadingBlanks,
  withValidDay,
} from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Segment = 'day' | 'month' | 'year';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DEFAULT_DECADE = 2000;
const OLDEST_DECADE = 1950;

function decadesUpTo(currentYear: number) {
  const latest = Math.floor(currentYear / 10) * 10;
  const decades: number[] = [];
  for (let d = OLDEST_DECADE; d <= latest; d += 10) decades.push(d);
  return decades;
}

function firstOpenSegment({ year, month }: DateParts): Segment {
  if (year === undefined) return 'year';
  if (month === undefined) return 'month';
  return 'day';
}

export default function BirthdayPicker({
  value,
  onChange,
}: {
  value: DateParts;
  onChange: (next: DateParts) => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [active, setActive] = useState<Segment>(() => firstOpenSegment(value));
  const [decade, setDecade] = useState(() =>
    value.year !== undefined ? Math.floor(value.year / 10) * 10 : DEFAULT_DECADE
  );

  function update(next: DateParts) {
    const valid = withValidDay(next);
    const complete =
      valid.year !== undefined && valid.month !== undefined && valid.day !== undefined;
    if (complete) haptics.success();
    else haptics.tick();
    onChange(valid);
  }

  function pickYear(year: number) {
    update({ ...value, year });
    setActive(value.month === undefined ? 'month' : 'day');
  }

  function pickMonth(month: number) {
    update({ ...value, month });
    setActive('day');
  }

  const segments: { key: Segment; label: string; text?: string; enabled: boolean }[] = [
    {
      key: 'day',
      label: 'Day',
      text: value.day?.toString(),
      enabled: value.month !== undefined,
    },
    {
      key: 'month',
      label: 'Month',
      text: value.month !== undefined ? MONTHS[value.month] : undefined,
      enabled: value.year !== undefined,
    },
    { key: 'year', label: 'Year', text: value.year?.toString(), enabled: true },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.segments}>
        {segments.map(({ key, label, text, enabled }) => {
          const isActive = active === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={`${label}${text ? `, ${text}` : ''}`}
              accessibilityState={{ selected: isActive, disabled: !enabled }}
              disabled={!enabled}
              onPress={() => {
                haptics.tick();
                setActive(key);
              }}
              style={[
                styles.segment,
                key === 'month' && styles.segmentWide,
                isActive && styles.segmentActive,
                !enabled && styles.segmentDisabled,
              ]}
            >
              <Text style={[styles.segmentLabel, isActive && { color: colors.mintInk }]}>
                {label}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.segmentValue, !text && { color: colors.inkFaint }]}
              >
                {text ?? '—'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View key={active} entering={FadeIn.duration(200)} style={styles.panel}>
        {active === 'year' && (
          <>
            <View style={styles.decades}>
              {decadesUpTo(currentYear).map((d) => (
                <Pressable
                  key={d}
                  accessibilityRole="button"
                  accessibilityState={{ selected: decade === d }}
                  onPress={() => {
                    haptics.tick();
                    setDecade(d);
                  }}
                  style={[styles.decade, decade === d && styles.decadeActive]}
                >
                  <Text style={[styles.decadeText, decade === d && { color: colors.onPrimary }]}>
                    {`${String(d).slice(2)}s`}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.grid}>
              {Array.from({ length: 10 }, (_, i) => decade + i).map((year) => (
                <Cell
                  key={year}
                  width="20%"
                  label={String(year)}
                  selected={value.year === year}
                  disabled={year > currentYear}
                  onPress={() => pickYear(year)}
                />
              ))}
            </View>
          </>
        )}

        {active === 'month' && value.year !== undefined && (
          <View style={styles.grid}>
            {MONTHS.map((name, month) => (
              <Cell
                key={name}
                width="33.333%"
                label={name.slice(0, 3)}
                accessibilityLabel={name}
                selected={value.month === month}
                disabled={isFutureDate(value.year!, month, 1, now)}
                onPress={() => pickMonth(month)}
              />
            ))}
          </View>
        )}

        {active === 'day' && value.year !== undefined && value.month !== undefined && (
          <View style={styles.grid}>
            {WEEKDAYS.map((weekday, i) => (
              <View key={i} style={[styles.cellWrap, { width: '14.2857%' }]}>
                <Text style={styles.weekday}>{weekday}</Text>
              </View>
            ))}
            {Array.from({ length: leadingBlanks(value.year, value.month) }, (_, i) => (
              <View key={`blank-${i}`} style={[styles.cellWrap, { width: '14.2857%' }]} />
            ))}
            {Array.from({ length: daysInMonth(value.year, value.month) }, (_, i) => i + 1).map(
              (day) => (
                <Cell
                  key={day}
                  width="14.2857%"
                  round
                  label={String(day)}
                  accessibilityLabel={`${day} ${MONTHS[value.month!]}`}
                  selected={value.day === day}
                  disabled={isFutureDate(value.year!, value.month!, day, now)}
                  onPress={() => update({ ...value, day })}
                />
              )
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function Cell({
  label,
  accessibilityLabel,
  width,
  selected,
  disabled,
  round,
  onPress,
}: {
  label: string;
  accessibilityLabel?: string;
  width: `${number}%`;
  selected: boolean;
  disabled?: boolean;
  round?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[styles.cellWrap, { width }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cell,
          round && styles.cellRound,
          selected && styles.cellSelected,
          disabled && styles.cellDisabled,
          pressed && !selected && { backgroundColor: colors.surfaceMuted },
        ]}
      >
        <Text style={[styles.cellText, selected && { color: colors.onPrimary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  segments: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  segmentWide: { flex: 1.7 },
  segmentActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  segmentDisabled: { opacity: 0.5 },
  segmentLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
  segmentValue: { fontFamily: fonts.heavy, fontSize: 18, color: colors.ink },
  panel: { gap: 12 },
  decades: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  decade: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decadeActive: { backgroundColor: colors.ink },
  decadeText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { padding: 3, alignItems: 'center' },
  cell: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellRound: { alignSelf: 'center', width: 42, height: 42, borderRadius: 21 },
  cellSelected: { backgroundColor: colors.primary },
  cellDisabled: { opacity: 0.3 },
  cellText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  weekday: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.inkFaint,
    paddingVertical: 6,
  },
});
