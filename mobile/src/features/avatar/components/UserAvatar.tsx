import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { avatarSource } from '@/features/avatar/avatars';
import { useAvatarId } from '@/features/avatar/avatarStore';
import { colors } from '@/theme';

/** The signed-in student's avatar on a soft round background. */
export default function UserAvatar({ size = 48, id }: { size?: number; id?: string }) {
  const chosen = useAvatarId();
  return (
    <View
      accessibilityElementsHidden
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Image source={avatarSource(id ?? chosen)} style={styles.image} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.mint, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
