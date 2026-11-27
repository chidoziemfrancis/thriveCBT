import { describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => ({}));

import { lineWidths } from '@/components/ui/Skeleton';

describe('lineWidths', () => {
  it('makes the last line shorter, like a real paragraph', () => {
    expect(lineWidths(3)).toEqual(['100%', '100%', '60%']);
  });

  it('keeps a single line full width', () => {
    expect(lineWidths(1)).toEqual(['100%']);
  });
});
