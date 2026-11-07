import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import { CheckInPhase, countdownLabel } from '@/features/checkin/checkinLogic';

export type NotificationKind = 'chat' | 'checkin' | 'mood' | 'session' | 'welcome';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  /** Something the student still has to do, as opposed to news. */
  todo: boolean;
  action?: string;
  title: string;
  body: string;
  at: string;
  icon: FeatureIconName;
  href: string;
};

export type NotificationInput = {
  now: Date;
  researcherName?: string;
  unreadMessages: number;
  lastMessageAt?: string;
  checkIn?: { startsAt: string; phase: CheckInPhase };
  moodLoggedToday: boolean;
  session: { id: number; title: string; complete: boolean; opensAt?: string };
  joinedAt?: string;
};

const HOUR = 60 * 60 * 1000;
const JOIN_EARLY_MS = 10 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Notifications are derived from the student's real state rather than stored, so the list
 * is always true: an item disappears as soon as the thing it asks for is done.
 */
export function buildNotifications(input: NotificationInput): AppNotification[] {
  const { now, researcherName = 'Your researcher' } = input;
  const items: AppNotification[] = [];

  if (input.unreadMessages > 0 && input.lastMessageAt) {
    items.push({
      id: `chat-${input.lastMessageAt}`,
      kind: 'chat',
      todo: false,
      title: `${researcherName} sent you a message`,
      body:
        input.unreadMessages === 1 ? 'Tap to read it.' : `${input.unreadMessages} unread messages`,
      at: input.lastMessageAt,
      icon: 'chat',
      href: '/chat',
    });
  }

  if (input.checkIn) {
    const start = new Date(input.checkIn.startsAt).getTime();
    if (input.checkIn.phase === 'joinable') {
      items.push({
        id: `checkin-open-${input.checkIn.startsAt}`,
        kind: 'checkin',
        todo: true,
        action: 'Join',
        title: 'Your check-in is ready',
        body: `${researcherName} is ready for your video call.`,
        at: new Date(start - JOIN_EARLY_MS).toISOString(),
        icon: 'video',
        href: '/call/lobby',
      });
    } else if (input.checkIn.phase === 'upcoming' && start - now.getTime() <= 24 * HOUR) {
      items.push({
        id: `checkin-soon-${input.checkIn.startsAt}`,
        kind: 'checkin',
        todo: false,
        title: 'Check-in coming up',
        body: `${countdownLabel(input.checkIn.startsAt, now)} with ${researcherName}.`,
        at: new Date(start - 24 * HOUR).toISOString(),
        icon: 'video',
        href: '/dashboard',
      });
    }
  }

  if (!input.moodLoggedToday) {
    const today = startOfDay(now);
    items.push({
      id: `mood-${today.toISOString()}`,
      kind: 'mood',
      todo: true,
      title: 'How are you feeling today?',
      body: 'Tap a face to log it.',
      at: today.toISOString(),
      icon: 'heart',
      href: '/dashboard',
    });
  }

  if (!input.session.complete) {
    items.push({
      id: `session-${input.session.id}`,
      kind: 'session',
      todo: true,
      action: 'Start',
      title: `Session ${input.session.id} is ready`,
      body: input.session.title,
      at: input.session.opensAt ?? input.joinedAt ?? now.toISOString(),
      icon: 'book',
      href: `/session/${input.session.id}`,
    });
  }

  if (input.joinedAt) {
    items.push({
      id: 'welcome',
      kind: 'welcome',
      todo: false,
      title: 'Welcome to ThriveCBT',
      body: 'We’re glad you’re here. Your 8 weeks start now.',
      at: input.joinedAt,
      icon: 'sun',
      href: '/dashboard',
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function unreadNotifications(items: AppNotification[], lastSeenAt: string | null) {
  const since = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  return items.filter((item) => new Date(item.at).getTime() > since).length;
}
