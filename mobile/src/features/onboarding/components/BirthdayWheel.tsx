import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import WheelPicker, { WHEEL_HEIGHT, WHEEL_ITEM_HEIGHT } from '@/components/ui/WheelPicker';
import { MONTHS, birthYears, clampDay, daysInMonth } from '@/lib/dates';
import { colors, radius } from '@/theme';

export type Birthday = { year: number; month: number; day: number };

export default function BirthdayWheel({
  value,
  onChange,
  onTouch,
}: {
  value: Birthday;
  onChange: (next: Birthday) => void;
  onTouch: () => void;
}) {
  const years = useMemo(() => birthYears(), []);
  const days = useMemo(
    () => Array.from({ length: daysInMonth(value.year, value.month) }, (_, i) => String(i + 1)),
    [value.year, value.month]
  );

  function update(next: Omit<Birthday, 'day'> & { day?: number }) {
    const day = clampDay(next.year, next.month, next.day ?? value.day);
    onChange({ year: next.year, month: next.month, day });
  }

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.highlight} />
      <WheelPicker
        accessibilityLabel="Birth month"
        items={MONTHS}
        index={value.month}
        onChange={(month) => update({ ...value, month })}
        onTouch={onTouch}
        flex={1.6}
      />
      <WheelPicker
        accessibilityLabel="Birth day"
        items={days}
        index={value.day - 1}
        onChange={(i) => update({ ...value, day: i + 1 })}
        onTouch={onTouch}
        flex={0.8}
      />
      <WheelPicker
        accessibilityLabel="Birth year"
        items={years.map(String)}
        index={Math.max(years.indexOf(value.year), 0)}
        onChange={(i) => update({ ...value, year: years[i] })}
        onTouch={onTouch}
        flex={1.1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    flexDirection: 'row',
    height: WHEEL_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
});
