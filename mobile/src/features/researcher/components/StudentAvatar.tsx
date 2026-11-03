import { StyleSheet, Text, View } from 'react-native';

import { initials } from '@/features/assignment/assign';
import { colors, fonts } from '@/theme';

const PALETTE = [
  { bg: colors.mint, ink: colors.mintInk },
  { bg: colors.lavender, ink: colors.lavenderInk },
  { bg: colors.peach, ink: colors.peachInk },
  { bg: colors.butter, ink: colors.butterInk },
];

// The same student always gets the same colour, so they're easy to spot across screens.
function toneFor(id: string) {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export default function StudentAvatar({
  id,
  name,
  size = 44,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const tone = toneFor(id);
  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg },
      ]}
    >
      <Text style={[styles.text, { fontSize: Math.round(size * 0.36), color: tone.ink }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bold },
});
