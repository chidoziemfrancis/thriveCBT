import { describe, expect, it } from '@jest/globals';

import {
  NotificationInput,
  buildNotifications,
  unreadNotifications,
} from '@/features/notifications/buildNotifications';

const now = new Date(2026, 9, 29, 15, 0);

function input(overrides: Partial<NotificationInput> = {}): NotificationInput {
  return {
    now,
    researcherName: 'Tunde',
    unreadMessages: 0,
    moodLoggedToday: true,
    session: { id: 1, title: 'Understanding Depression', complete: true },
    ...overrides,
  };
}

const ids = (items: { id: string }[]) => items.map((i) => i.id.split('-')[0]);

describe('buildNotifications', () => {
  it('is empty when there is nothing to do', () => {
    expect(buildNotifications(input())).toEqual([]);
  });

  it('only lists what still needs doing', () => {
    const items = buildNotifications(
      input({
        unreadMessages: 2,
        lastMessageAt: new Date(2026, 9, 29, 14).toISOString(),
        moodLoggedToday: false,
        session: { id: 1, title: 'Understanding Depression', complete: false },
      })
    );
    expect(ids(items).sort()).toEqual(['chat', 'mood', 'session']);
    expect(items.find((i) => i.id.startsWith('chat'))?.body).toBe('2 unread messages');
  });

  it('points a joinable check-in at the lobby and hides far-off ones', () => {
    const joinable = buildNotifications(
      input({
        checkIn: { startsAt: new Date(2026, 9, 29, 15, 5).toISOString(), phase: 'joinable' },
      })
    );
    expect(joinable[0].href).toBe('/call/lobby');

    const nextWeek = buildNotifications(
      input({ checkIn: { startsAt: new Date(2026, 10, 5, 15).toISOString(), phase: 'upcoming' } })
    );
    expect(nextWeek).toEqual([]);

    const tomorrow = buildNotifications(
      input({ checkIn: { startsAt: new Date(2026, 9, 30, 9).toISOString(), phase: 'upcoming' } })
    );
    expect(tomorrow[0].title).toBe('Check-in coming up');
  });

  it('sorts newest first', () => {
    const items = buildNotifications(
      input({
        joinedAt: new Date(2026, 9, 20).toISOString(),
        unreadMessages: 1,
        lastMessageAt: new Date(2026, 9, 29, 14).toISOString(),
      })
    );
    expect(ids(items)).toEqual(['chat', 'welcome']);
  });
});

describe('unreadNotifications', () => {
  it('counts items newer than the last visit', () => {
    const items = buildNotifications(
      input({ moodLoggedToday: false, joinedAt: new Date(2026, 9, 20).toISOString() })
    );
    expect(unreadNotifications(items, null)).toBe(2);
    expect(unreadNotifications(items, new Date(2026, 9, 25).toISOString())).toBe(1);
    expect(unreadNotifications(items, now.toISOString())).toBe(0);
  });
});
