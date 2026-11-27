import { Image } from 'expo-image';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { RESEARCHER_PHOTOS } from '../constants/researcherPhotos';
import { initials } from '../utils/names';

/**
 * Fills its avatar container with the researcher's photo, or falls back to their initials.
 * The container sets the size and shape and needs `overflow: 'hidden'`.
 */
export default function ResearcherPhoto({
  researcher,
  initialsStyle,
}: {
  researcher: { id: string; name: string } | undefined;
  initialsStyle: StyleProp<TextStyle>;
}) {
  const photo = researcher ? RESEARCHER_PHOTOS[researcher.id] : undefined;
  if (photo) {
    return (
      <Image
        source={photo}
        style={styles.fill}
        contentFit="cover"
        accessibilityLabel={researcher ? `Photo of ${researcher.name}` : undefined}
      />
    );
  }
  return <Text style={initialsStyle}>{researcher ? initials(researcher.name) : '?'}</Text>;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
