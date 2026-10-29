import Svg, { Path } from 'react-native-svg';

// Kept in step with assets/brand/sprout-mark.svg, which renders the native splash image.
export const SPROUT_MARK_VIEWBOX = { width: 60, height: 50 };

export default function SproutMark({
  width,
  leaf = '#FFFFFF',
  accent = '#B5E8D8',
}: {
  width: number;
  leaf?: string;
  accent?: string;
}) {
  const height = (width * SPROUT_MARK_VIEWBOX.height) / SPROUT_MARK_VIEWBOX.width;
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${SPROUT_MARK_VIEWBOX.width} ${SPROUT_MARK_VIEWBOX.height}`}
      accessibilityElementsHidden
    >
      <Path d="M30 30C30 17 21 7 6 6c0 14 9 24 24 24z" fill={leaf} />
      <Path d="M30 30c0-14 10-24 25-24 0 15-10 24-25 24z" fill={accent} />
      <Path d="M30 30v16" stroke={leaf} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}
