import type { ImageSource } from 'expo-image';

// Fluent Emoji 3D by Microsoft, MIT licensed (see assets/images/emoji/LICENSE).
export const EMOJI = {
  clipboard: require('@/assets/images/emoji/clipboard.png'),
  books: require('@/assets/images/emoji/books.png'),
  videoCamera: require('@/assets/images/emoji/video-camera.png'),
  chequeredFlag: require('@/assets/images/emoji/chequered-flag.png'),
  speechBalloon: require('@/assets/images/emoji/speech-balloon.png'),
  growingHeart: require('@/assets/images/emoji/growing-heart.png'),
  faceDisappointed: require('@/assets/images/emoji/face-disappointed.png'),
  faceConfused: require('@/assets/images/emoji/face-confused.png'),
  faceNeutral: require('@/assets/images/emoji/face-neutral.png'),
  faceSlightlySmiling: require('@/assets/images/emoji/face-slightly-smiling.png'),
  faceGrinning: require('@/assets/images/emoji/face-grinning.png'),
} satisfies Record<string, ImageSource>;

export type EmojiName = keyof typeof EMOJI;
