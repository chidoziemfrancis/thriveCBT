import { StyleSheet, Text, View } from 'react-native';

import { severityBand } from '@/features/assessment';
import { colors, fonts, radius } from '@/theme';

const BANDS = ['Minimal', 'Mild', 'Moderate', 'Moderately severe', 'Severe'];

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** One PHQ-9 result as a band in words over the same five-part meter as the first result. */
export default function BandMeter({
  label,
  score,
  at,
  muted,
}: {
  label: string;
  score: number;
  at: string;
  muted?: boolean;
}) {
  const band = severityBand(score);
  const filled = BANDS.indexOf(band);
  return (
    <View style={styles.band} accessible accessibilityLabel={`${label}, ${shortDate(at)}: ${band}`}>
      <View style={styles.top}>
        <Text style={styles.name}>{band}</Text>
        <Text style={styles.when}>
          {label} · {shortDate(at)}
        </Text>
      </View>
      <View style={styles.meter}>
        {BANDS.map((name, i) => (
          <View
            key={name}
            style={[
              styles.segment,
              i <= filled && { backgroundColor: muted ? colors.inkFaint : colors.primary },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { gap: 8 },
  top: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { flexShrink: 1, fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  when: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  meter: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
});
