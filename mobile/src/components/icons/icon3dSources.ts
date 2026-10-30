import type { ImageSource } from 'expo-image';

// 3dicons by realvjy (3dicons.co), CC0 licensed (see assets/images/icons3d/LICENSE).
export const ICONS_3D = {
  bag: require('@/assets/images/icons3d/bag.png'),
  bulb: require('@/assets/images/icons3d/bulb.png'),
  chart: require('@/assets/images/icons3d/chart.png'),
  chat: require('@/assets/images/icons3d/chat.png'),
  chatBubble: require('@/assets/images/icons3d/chat-bubble.png'),
  fileText: require('@/assets/images/icons3d/file-text.png'),
  flag: require('@/assets/images/icons3d/flag.png'),
  heart: require('@/assets/images/icons3d/heart.png'),
  lock: require('@/assets/images/icons3d/lock.png'),
  mail: require('@/assets/images/icons3d/mail.png'),
  medal: require('@/assets/images/icons3d/medal.png'),
  mobile: require('@/assets/images/icons3d/mobile.png'),
  notebook: require('@/assets/images/icons3d/notebook.png'),
  notifyHeart: require('@/assets/images/icons3d/notify-heart.png'),
  pencil: require('@/assets/images/icons3d/pencil.png'),
  phoneRinging: require('@/assets/images/icons3d/phone-ringing.png'),
  play: require('@/assets/images/icons3d/play.png'),
  shield: require('@/assets/images/icons3d/sheild.png'),
  sun: require('@/assets/images/icons3d/sun.png'),
  target: require('@/assets/images/icons3d/target.png'),
  tick: require('@/assets/images/icons3d/tick.png'),
  trophy: require('@/assets/images/icons3d/trophy.png'),
  umbrella: require('@/assets/images/icons3d/umbrella.png'),
  videoCamera: require('@/assets/images/icons3d/video-camera.png'),
  zoom: require('@/assets/images/icons3d/zoom.png'),
} satisfies Record<string, ImageSource>;

export type Icon3DName = keyof typeof ICONS_3D;
