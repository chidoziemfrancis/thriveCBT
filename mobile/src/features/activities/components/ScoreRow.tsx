import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

const SCORES = Array.from({ length: 11 }, (_, i) => i);

/** A 0–10 rating as a row of numbered dots, with words under each end. */
export default function ScoreRow({
  label,
  value,
  onChange,
  color = colors.primary,
  low = 'None',
  high = 'Loads',
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  color?: string;
  low?: string;
  high?: string;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {value !== undefined && <Text style={[styles.value, { color }]}>{value} / 10</Text>}
      </View>
      <View style={styles.row}>
        {SCORES.map((n) => {
          const on = value === n;
          const under = value !== undefined && n < value;
          return (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${n} out of 10`}
              hitSlop={4}
              onPress={() => {
                haptics.tick();
                onChange(n);
              }}
              style={[
                styles.dot,
                under && { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
                on && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={[styles.n, on && styles.nOn]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>{low}</Text>
        <Text style={styles.end}>{high}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  value: { fontFamily: fonts.heavy, fontSize: 14 },
  row: { flexDirection: 'row', gap: 3 },
  dot: {
    flex: 1,
    maxWidth: 32,
    aspectRatio: 1,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  n: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkMuted },
  nOn: { color: colors.onPrimary },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
