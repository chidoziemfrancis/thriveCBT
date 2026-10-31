import type { ImageSource } from 'expo-image';

// Stock portraits for the mock researchers, free under the Pexels licence (credits in
// assets/images/researchers/CREDITS.md). Real researchers' photos will come from the backend.
export const RESEARCHER_PHOTOS: Record<string, ImageSource> = {
  'r-amara': require('@/assets/images/researchers/amara.jpg'),
  'r-tunde': require('@/assets/images/researchers/tunde.jpg'),
  'r-grace': require('@/assets/images/researchers/grace.jpg'),
};
