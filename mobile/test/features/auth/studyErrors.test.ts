import { describe, expect, it } from '@jest/globals';

import { studyErrorRoute } from '@/features/auth/utils/studyErrors';
import { ApiError } from '@/lib/api-error';

const error = (code: string) => new ApiError(code, 'message', 403);

describe('studyErrorRoute', () => {
  it('signs a withdrawn student out and shows the withdrawn screen', () => {
    for (const code of ['STUDY_WITHDRAWN', 'AUTH_ACCOUNT_WITHDRAWN']) {
      expect(studyErrorRoute(error(code))).toEqual({
        route: '/profile/withdrawn',
        signOut: true,
      });
    }
  });

  it('sends a student without consent to the study information', () => {
    expect(studyErrorRoute(error('CONSENT_REQUIRED'))).toEqual({
      route: '/consent/study-info',
      signOut: false,
    });
  });

  it('leaves every other error to the screen', () => {
    expect(studyErrorRoute(error('VALIDATION_FAILED'))).toBeNull();
    expect(studyErrorRoute(error('NETWORK_ERROR'))).toBeNull();
  });
});
