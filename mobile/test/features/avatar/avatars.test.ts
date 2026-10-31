import { describe, expect, it } from '@jest/globals';

import { AVATARS, avatarSource, defaultAvatarId } from '@/features/avatar/avatars';

describe('avatars', () => {
  it('gives the same email the same default avatar, whatever the case', () => {
    expect(defaultAvatarId('Test@Gmail.com')).toBe(defaultAvatarId('test@gmail.com'));
  });

  it('always picks a real avatar', () => {
    const ids = AVATARS.map((a) => a.id);
    for (const email of ['a@b.c', 'student@uni.edu', '', 'x']) {
      expect(ids).toContain(defaultAvatarId(email));
    }
  });

  it('spreads defaults across the set', () => {
    const picked = new Set(
      Array.from({ length: 60 }, (_, i) => defaultAvatarId(`student${i}@uni.edu`))
    );
    expect(picked.size).toBeGreaterThan(AVATARS.length / 2);
  });

  it('falls back to the first avatar for an unknown id', () => {
    expect(avatarSource('missing')).toBe(AVATARS[0].source);
  });
});
