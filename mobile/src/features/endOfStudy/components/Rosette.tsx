import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/** The completion badge: an outline rosette, in keeping with the app's line icons. */
export default function Rosette({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" accessibilityElementsHidden>
      <Path
        d="M23 37l-5 17 8-4 4 7 3-11M41 37l5 17-8-4-4 7-3-11"
        stroke={colors.primary}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={colors.primarySoft}
      />
      <Circle
        cx={32}
        cy={26}
        r={15}
        fill={colors.surface}
        stroke={colors.primary}
        strokeWidth={2.2}
      />
      <Path
        d="M32 17.5l2.7 5.4 6 .9-4.35 4.2 1 5.9L32 31.1l-5.35 2.8 1-5.9-4.35-4.2 6-.9z"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
        fill={colors.primarySoft}
      />
    </Svg>
  );
}
