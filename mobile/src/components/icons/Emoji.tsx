import { Image } from 'expo-image';

import { EMOJI, EmojiName } from './emojiSources';

export default function Emoji({ name, size = 32 }: { name: EmojiName; size?: number }) {
  return (
    <Image
      source={EMOJI[name]}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible={false}
    />
  );
}
