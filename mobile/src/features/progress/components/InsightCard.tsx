import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import { colors, fonts, radius } from '@/theme';

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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.mint,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 15, color: colors.mintInk },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
});
