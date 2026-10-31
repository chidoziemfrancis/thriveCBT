import { Image } from 'expo-image';

import { ICONS_3D, Icon3DName } from './icon3dSources';

/** A decorative 3D icon; labels belong on the surrounding control, not the image. */
export default function Icon3D({ name, size = 32 }: { name: Icon3DName; size?: number }) {
  return (
    <Image
      source={ICONS_3D[name]}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible={false}
    />
  );
}
