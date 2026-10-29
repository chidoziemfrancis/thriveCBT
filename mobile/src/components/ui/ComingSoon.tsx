import { StyleSheet, Text, View } from 'react-native';

import Emoji from '@/components/icons/Emoji';
import type { EmojiName } from '@/components/icons/emojiSources';
import Screen from '@/components/ui/Screen';
import { type } from '@/theme';

export default function ComingSoon({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: EmojiName;
}) {
  return (
    <Screen insideTabs>
      <Text style={type.title}>{title}</Text>
      <View style={styles.body}>
        <Emoji name={emoji} size={88} />
        <Text style={[type.body, styles.center]}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  center: { textAlign: 'center', maxWidth: 280 },
});
