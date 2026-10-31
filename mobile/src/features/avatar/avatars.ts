import type { ImageSource } from 'expo-image';

// Micah avatars by Mike Mangialardi, CC BY 4.0 (credits in assets/images/avatars/CREDITS.md).
export const AVATARS: { id: string; source: ImageSource }[] = [
  { id: 'avatar-01', source: require('@/assets/images/avatars/avatar-01.png') },
  { id: 'avatar-02', source: require('@/assets/images/avatars/avatar-02.png') },
  { id: 'avatar-03', source: require('@/assets/images/avatars/avatar-03.png') },
  { id: 'avatar-04', source: require('@/assets/images/avatars/avatar-04.png') },
  { id: 'avatar-05', source: require('@/assets/images/avatars/avatar-05.png') },
  { id: 'avatar-06', source: require('@/assets/images/avatars/avatar-06.png') },
  { id: 'avatar-07', source: require('@/assets/images/avatars/avatar-07.png') },
  { id: 'avatar-08', source: require('@/assets/images/avatars/avatar-08.png') },
  { id: 'avatar-09', source: require('@/assets/images/avatars/avatar-09.png') },
  { id: 'avatar-10', source: require('@/assets/images/avatars/avatar-10.png') },
  { id: 'avatar-11', source: require('@/assets/images/avatars/avatar-11.png') },
  { id: 'avatar-12', source: require('@/assets/images/avatars/avatar-12.png') },
];

/** A stable default for someone who hasn't picked yet, so the same email always gets the same face. */
export function defaultAvatarId(seed: string): string {
  const hash = [...seed.toLowerCase()].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return AVATARS[hash % AVATARS.length].id;
}

export function avatarSource(id: string): ImageSource {
  return (AVATARS.find((a) => a.id === id) ?? AVATARS[0]).source;
}
