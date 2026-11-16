import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export const TREE = { width: 240, height: 300 };

/** Leaves, branches and roots, top to bottom, as a share of the tree's size. */
export const TREE_SPOTS = [
  { x: 0.5, y: 0.2 },
  { x: 0.5, y: 0.46 },
  { x: 0.5, y: 0.84 },
];

const INK = colors.primary;

/** Thoughts are the leaves, rules the branches and core beliefs the roots under the ground. */
export default function Tree() {
  return (
    <Svg width={TREE.width} height={TREE.height} viewBox="0 0 240 300">
      <Path d="M0 196 H240 V300 H0z" fill={colors.butter} />
      <Path d="M0 196 H240" stroke={INK} strokeWidth={3} strokeDasharray="6 6" />
      <Path
        d="M120 196 C118 230 96 250 64 276 M120 200 C124 236 150 254 184 280 M120 204 C120 240 118 262 122 292"
        stroke={colors.butterInk}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M110 196 V126 C96 116 84 108 70 98 M130 196 V122 C144 112 158 104 172 96 M120 140 V100"
        stroke={INK}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {[
        [120, 46, 38],
        [76, 70, 32],
        [164, 70, 32],
        [98, 88, 28],
        [144, 88, 28],
      ].map(([cx, cy, r]) => (
        <Circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="#9CCFB3"
          stroke={INK}
          strokeWidth={3}
        />
      ))}
    </Svg>
  );
}
