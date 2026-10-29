import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Haptics from 'expo-haptics';

import { haptics } from '@/lib/haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Soft: 'soft' },
  NotificationFeedbackType: { Success: 'success' },
}));

const impact = jest.mocked(Haptics.impactAsync);

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('haptics', () => {
  it('maps tap, tick and success to the matching native feedback', () => {
    haptics.tap();
    haptics.tick();
    haptics.success();

    expect(impact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('plays a soft beat then a stronger beat for the heartbeat', () => {
    haptics.heartbeat();
    expect(impact.mock.calls).toEqual([[Haptics.ImpactFeedbackStyle.Soft]]);

    jest.advanceTimersByTime(140);
    expect(impact.mock.calls).toEqual([
      [Haptics.ImpactFeedbackStyle.Soft],
      [Haptics.ImpactFeedbackStyle.Medium],
    ]);
  });

  it('fires one tap per ripple delay and stops when cancelled', () => {
    const cancel = haptics.ripple([100, 200, 300]);

    jest.advanceTimersByTime(200);
    expect(impact).toHaveBeenCalledTimes(2);

    cancel();
    jest.advanceTimersByTime(500);
    expect(impact).toHaveBeenCalledTimes(2);
  });

  it('swallows a failing haptics call instead of throwing', async () => {
    impact.mockReturnValueOnce(Promise.reject(new Error('no motor')));
    expect(() => haptics.tap()).not.toThrow();
    await Promise.resolve();
  });
});
