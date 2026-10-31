import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import { colors, fonts } from '@/theme';

export default function InsightCard({ text }: { text: string }) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`Insight: ${text}`}>
      <FeatureIcon name="bulb" size={44} tone="plain" />
      <View style={styles.text}>
        <Text style={styles.title}>Insight</Text>
        <Text style={styles.body}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A quote-style line rather than a box, so it reads as a thought, not another card.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 15, color: colors.mintInk },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
});
