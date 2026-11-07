import Svg, { Path } from 'react-native-svg';

export default function Cloud({ size = 96, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size * 0.62} viewBox="0 0 100 62">
      <Path d="M24 58h54a18 18 0 0 0 1-36 24 24 0 0 0-45-6A20 20 0 0 0 24 58z" fill={color} />
    </Svg>
  );
}
