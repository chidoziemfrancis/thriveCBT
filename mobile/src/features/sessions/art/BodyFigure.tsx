import Svg, { Circle, Path } from 'react-native-svg';

export type BodySpot = 'head' | 'chest' | 'belly' | 'feet';

export const FIGURE = { width: 180, height: 300 };

/** Where each spot sits on the figure, as a share of its width and height. */
export const SPOTS: Record<BodySpot, { x: number; y: number }> = {
  head: { x: 0.5, y: 0.12 },
  chest: { x: 0.5, y: 0.36 },
  belly: { x: 0.5, y: 0.52 },
  feet: { x: 0.5, y: 0.93 },
};

/** A calm outline of a student, drawn rather than photographed so any student can see themselves. */
export default function BodyFigure({ color, fill }: { color: string; fill: string }) {
  return (
    <Svg width={FIGURE.width} height={FIGURE.height} viewBox="0 0 180 300">
      <Circle cx={90} cy={36} r={26} fill={fill} stroke={color} strokeWidth={3} />
      <Path
        d="M52 90c0-14 12-22 38-22s38 8 38 22v80c0 8-6 12-12 12H64c-6 0-12-4-12-12z"
        fill={fill}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M52 96 34 160M128 96l18 64"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M72 182v92M108 182v92M60 276h22M98 276h22"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
