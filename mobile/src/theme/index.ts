export const colors = {
  background: '#FBF7F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEE5',
  border: '#E6DFD3',
  ink: '#1F2A2E',
  inkMuted: '#5B6770',
  inkFaint: '#8A949A',

  primary: '#12806F',
  primaryEdge: '#0C5C50',
  primarySoft: '#DDF3EC',
  onPrimary: '#FFFFFF',

  lavender: '#ECE6FB',
  lavenderInk: '#5B47B8',
  peach: '#FDE7D8',
  peachInk: '#B4532A',
  butter: '#FBF0CC',
  butterInk: '#8A6410',
  mint: '#DDF3EC',
  mintInk: '#0E6B5D',

  danger: '#C2362B',
  dangerSoft: '#FCE9E7',
} as const;

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  bold: 'Geist_600SemiBold',
  heavy: 'Geist_700Bold',
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;

export const type = {
  display: {
    fontFamily: fonts.heavy,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.heavy,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.inkMuted },
  label: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
} as const;
