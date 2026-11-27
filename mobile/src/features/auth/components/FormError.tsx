import Animated, { FadeIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/theme';

export default function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <Animated.Text
      entering={FadeIn.duration(200)}
      style={styles.error}
      accessibilityLiveRegion="assertive"
    >
      {message}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.danger },
});
