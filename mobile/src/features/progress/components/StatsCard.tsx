import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

export type Stat = { label: string; value: string };

export default function StatsCard({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.card}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={styles.stat}
          accessible
          accessibilityLabel={`${stat.label}: ${stat.value}`}
        >
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { width: '50%', gap: 4 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  value: { fontFamily: fonts.heavy, fontSize: 18, color: colors.primary },
});
