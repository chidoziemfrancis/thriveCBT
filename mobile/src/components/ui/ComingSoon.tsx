import { StyleSheet, Text, View } from 'react-native';

import Icon3D from '@/components/icons/Icon3D';
import type { Icon3DName } from '@/components/icons/icon3dSources';
import Screen from '@/components/ui/Screen';
import { type } from '@/theme';

export default function ComingSoon({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: Icon3DName;
}) {
  return (
    <Screen insideTabs>
      <Text style={type.title}>{title}</Text>
      <View style={styles.body}>
        <Icon3D name={image} size={88} />
        <Text style={[type.body, styles.center]}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  center: { textAlign: 'center', maxWidth: 280 },
});
