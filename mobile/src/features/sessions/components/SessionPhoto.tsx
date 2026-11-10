import { Image } from 'expo-image';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Glyph } from '@/components/icons/FeatureIcon';
import { PHOTO_ALT, PHOTOS, type PhotoKey } from '@/features/sessions/photos';
import { colors, fonts, radius } from '@/theme';

/** A session photo, or a soft labelled stand-in until that photo is chosen. */
export default function SessionPhoto({
  photo,
  style,
}: {
  photo: PhotoKey;
  style?: StyleProp<ViewStyle>;
}) {
  const source = PHOTOS[photo];
  return (
    <View
      style={[styles.frame, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={PHOTO_ALT[photo]}
    >
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.stand}>
          <Glyph name="eye" size={22} color={colors.primary} />
          <Text style={styles.standText} numberOfLines={2}>
            {PHOTO_ALT[photo]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.primarySoft },
  stand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16 },
  standText: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
