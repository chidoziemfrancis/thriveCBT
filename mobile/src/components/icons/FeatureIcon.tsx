import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

// Outline glyphs on a 24-unit grid, each a list of stroked paths so they share one weight.
const GLYPHS = {
  bag: [
    'M6 10a4 4 0 014-4h4a4 4 0 014 4v9a2 2 0 01-2 2H8a2 2 0 01-2-2z',
    'M9.5 6V5a2.5 2.5 0 015 0v1',
    'M6 13h12',
    'M10 13v2.5',
    'M14 13v2.5',
  ],
  bell: ['M6 16v-5a6 6 0 0112 0v5l1.5 2h-15z', 'M10 21h4'],
  book: [
    'M5 19.5V4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5z',
    'M5 19.5A1.5 1.5 0 006.5 21H19v-3',
    'M9 7.5h6',
  ],
  bulb: [
    'M12 3a6 6 0 00-3.5 10.9c.3.3.5.7.5 1.1v2h6v-2c0-.4.2-.8.5-1.1A6 6 0 0012 3z',
    'M10 20.5h4',
  ],
  chart: ['M4 20h16', 'M7 16v-4', 'M12 16V8', 'M17 16v-7'],
  chat: [
    'M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v9a1.5 1.5 0 01-1.5 1.5H9l-5 4z',
    'M8 9h8',
    'M8 12h5',
  ],
  checkCircle: ['M12 3a9 9 0 110 18 9 9 0 010-18z', 'M8 12.5l2.5 2.5L16 9.5'],
  device: ['M7 4a1 1 0 011-1h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1z', 'M11 18h2'],
  document: [
    'M6 4a1 1 0 011-1h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1z',
    'M14 3v4h4',
    'M9 12h6',
    'M9 16h6',
  ],
  eye: [
    'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z',
    'M12 9a3 3 0 110 6 3 3 0 010-6z',
  ],
  flag: ['M5 21V4', 'M5 4h12l-2.5 4 2.5 4H5'],
  heart: ['M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z'],
  logout: ['M14 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4', 'M9 16l-4-4 4-4', 'M5 12h10'],
  lock: [
    'M5 12a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1z',
    'M8 11V8a4 4 0 018 0v3',
  ],
  mail: [
    'M3.5 6.5A1.5 1.5 0 015 5h14a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 0119 19H5a1.5 1.5 0 01-1.5-1.5z',
    'M4 7l8 6 8-6',
  ],
  pencil: ['M15.5 4.5l4 4L9 19l-5 1 1-5z', 'M13.5 6.5l4 4'],
  phone: ['M5 4h3l2 5-2.5 1.5a11 11 0 006 6L15 14l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z'],
  play: ['M12 3a9 9 0 110 18 9 9 0 010-18z', 'M10 8.5v7l5.5-3.5z'],
  shield: ['M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z', 'M9 12l2 2 4-4'],
  sun: [
    'M12 8a4 4 0 110 8 4 4 0 010-8z',
    'M12 2.5v2',
    'M12 19.5v2',
    'M2.5 12h2',
    'M19.5 12h2',
    'M5.3 5.3l1.4 1.4',
    'M17.3 17.3l1.4 1.4',
    'M5.3 18.7l1.4-1.4',
    'M17.3 6.7l1.4-1.4',
  ],
  trophy: [
    'M8 4h8v5a4 4 0 01-8 0z',
    'M8 6H5.5a2.5 2.5 0 002.7 3.5',
    'M16 6h2.5a2.5 2.5 0 01-2.7 3.5',
    'M12 13v4',
    'M8.5 20.5h7',
    'M9.5 17h5v3.5h-5z',
  ],
  umbrella: ['M3 12a9 9 0 0118 0z', 'M12 12v6a2 2 0 01-4 0'],
  video: [
    'M3 7.5A1.5 1.5 0 014.5 6h9A1.5 1.5 0 0115 7.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 16.5z',
    'M15 10.5l6-3.5v10l-6-3.5',
  ],
} satisfies Record<string, string[]>;

export type FeatureIconName = keyof typeof GLYPHS;

export const TONES = {
  mint: { bg: colors.mint, ink: colors.mintInk },
  lavender: { bg: colors.lavender, ink: colors.lavenderInk },
  peach: { bg: colors.peach, ink: colors.peachInk },
  butter: { bg: colors.butter, ink: colors.butterInk },
  neutral: { bg: colors.surfaceMuted, ink: colors.inkFaint },
  // For icons sitting on a tinted card, where a tinted tile would disappear.
  plain: { bg: colors.surface, ink: colors.primary },
} as const;

export type FeatureIconTone = keyof typeof TONES;

export function Glyph({
  name,
  size = 24,
  color,
}: {
  name: FeatureIconName;
  size?: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {GLYPHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

/** A clean outline icon on a soft tinted rounded square. `size` is the square’s width. */
export default function FeatureIcon({
  name,
  size = 44,
  tone = 'mint',
}: {
  name: FeatureIconName;
  size?: number;
  tone?: FeatureIconTone;
}) {
  const { bg, ink } = TONES[tone];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Glyph name={name} size={Math.round(size * 0.5)} color={ink} />
    </View>
  );
}
