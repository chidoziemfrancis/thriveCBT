import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import { colors, fonts, radius } from '@/theme';

export type Highlight = { label: string; value: string | number; icon: FeatureIconName };

export default function Highlights({ items }: { items: Highlight[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.tile}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
        >
          <FeatureIcon name={item.icon} size={40} />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  value: { fontFamily: fonts.heavy, fontSize: 24, color: colors.ink, marginTop: 6 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
