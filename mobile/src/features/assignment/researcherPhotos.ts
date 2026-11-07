import type { ImageSource } from 'expo-image';

// Illustrated portraits for the mock researchers (credits in assets/images/researchers/CREDITS.md).
// Real researchers' pictures will come from the backend.
export const RESEARCHER_PHOTOS: Record<string, ImageSource> = {
  'r-amara': require('@/assets/images/researchers/amara.svg'),
  'r-tunde': require('@/assets/images/researchers/tunde.svg'),
  'r-grace': require('@/assets/images/researchers/grace.svg'),
};
