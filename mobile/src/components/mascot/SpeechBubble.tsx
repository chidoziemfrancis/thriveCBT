import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import Mascot from './Mascot';

// Sprout says a line, Finch-style, to keep each step feeling like a chat.
export default function SpeechBubble({
  children,
  mood = 'happy',
}: {
  children: React.ReactNode;
  mood?: 'happy' | 'calm' | 'cheer';
}) {
  return (
    <View style={styles.row}>
      <Mascot size={64} mood={mood} />
      <View style={styles.bubble}>
        <Text style={styles.text}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
});
