import Svg, { Circle, Path } from 'react-native-svg';

import { MOODS } from '@/features/mood/moods';
import { colors } from '@/theme';

// Mouths run from a deep frown (0) to a big open smile (4).
const MOUTHS = [
  'M13 29q7-8 14 0',
  'M13.5 28q6.5-4 13 0',
  'M13.5 26.5h13',
  'M13 25q7 6 14 0',
  'M12 23.5q8 10 16 0z',
];

/**
 * A simple drawn face for each mood. `filled` sits the face on its mood colour; otherwise it's
 * just the features, for drawing over something already coloured.
 */
export default function MoodFace({
  mood,
  size = 36,
  filled = true,
}: {
  mood: number;
  size?: number;
  filled?: boolean;
}) {
  const ink = colors.ink;
  const sad = mood === 0;
  const beaming = mood === MOODS.length - 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityElementsHidden>
      {filled && <Circle cx={20} cy={20} r={19} fill={MOODS[mood].color} />}

      {beaming ? (
        <>
          <Path
            d="M11 17q3-4 6 0"
            stroke={ink}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M23 17q3-4 6 0"
            stroke={ink}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : sad ? (
        <>
          {/* Inner brow ends lifted reads as sad; lowered would read as angry. */}
          <Path d="M10.5 13.5l5.5-2" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M29.5 13.5l-5.5-2" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
          <Circle cx={14} cy={18} r={2.1} fill={ink} />
          <Circle cx={26} cy={18} r={2.1} fill={ink} />
        </>
      ) : (
        <>
          <Circle cx={14} cy={16} r={2.3} fill={ink} />
          <Circle cx={26} cy={16} r={2.3} fill={ink} />
        </>
      )}

      <Path
        d={MOUTHS[mood]}
        stroke={ink}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={beaming ? ink : 'none'}
      />
    </Svg>
  );
}
