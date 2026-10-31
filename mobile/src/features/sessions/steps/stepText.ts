import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/theme';

/** Shared type for every step, so a session reads as one consistent story. */
export const stepText = StyleSheet.create({
  center: { alignItems: 'center', gap: 28, paddingTop: 12 },
  block: { gap: 12, alignSelf: 'stretch' },
  centered: { textAlign: 'center' },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 30, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.inkMuted },
  feedback: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
