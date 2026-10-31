import { StyleSheet, Text, View } from 'react-native';

import { CONSENT_IS_DRAFT } from '@/features/consent/consentContent';
import { colors, fonts, radius } from '@/theme';

export default function DraftTag() {
  if (!CONSENT_IS_DRAFT) return null;
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>Draft wording, awaiting ethics approval</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.butter,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: { fontFamily: fonts.bold, fontSize: 12, color: colors.butterInk },
});
