import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import Screen from '@/components/ui/Screen';
import { type } from '@/theme';

export default function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: FeatureIconName;
}) {
  return (
    <Screen insideTabs>
      <Text style={type.title}>{title}</Text>
      <View style={styles.body}>
        <FeatureIcon name={icon} size={88} />
        <Text style={[type.body, styles.center]}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  center: { textAlign: 'center', maxWidth: 280 },
});
