import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme';

type Mood = 'happy' | 'calm' | 'cheer';

// "Sprout", ThriveCBT's buddy: a round seedling that grows with the student.
export default function Mascot({ size = 120, mood = 'happy' }: { size?: number; mood?: Mood }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Path d="M60 34C60 22 52 13 39 12c0 13 8 22 21 22z" fill={colors.primary} />
      <Path d="M60 34c0-13 9-22 23-22 0 14-9 22-23 22z" fill="#2FA58F" />
      <Path d="M60 34v10" stroke={colors.primaryEdge} strokeWidth={3} strokeLinecap="round" />

      <Ellipse cx={60} cy={76} rx={42} ry={38} fill="#8FD9C2" />
      <Ellipse cx={60} cy={84} rx={30} ry={24} fill="#B5E8D8" />

      {mood === 'calm' ? (
        <>
          <Path d="M41 70q5 4 10 0" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M69 70q5 4 10 0" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <Circle cx={46} cy={69} r={5} fill={colors.ink} />
          <Circle cx={74} cy={69} r={5} fill={colors.ink} />
          <Circle cx={47.5} cy={67.5} r={1.6} fill="#fff" />
          <Circle cx={75.5} cy={67.5} r={1.6} fill="#fff" />
        </>
      )}

      <Ellipse cx={36} cy={80} rx={6} ry={4} fill="#F4A58A" opacity={0.8} />
      <Ellipse cx={84} cy={80} rx={6} ry={4} fill="#F4A58A" opacity={0.8} />

      {mood === 'cheer' ? (
        <Path d="M50 80q10 12 20 0z" fill={colors.ink} />
      ) : (
        <Path d="M52 81q8 6 16 0" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}
