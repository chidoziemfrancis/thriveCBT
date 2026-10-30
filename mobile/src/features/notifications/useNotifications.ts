import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { useChat } from '@/features/chat/chatStore';
import { checkInPhase } from '@/features/checkin/checkinLogic';
import { getNextCheckIn } from '@/features/checkin/checkinStore';
import { getConsent } from '@/features/consent/consentStore';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { todaysMood } from '@/features/mood/moodStore';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { readJson, writeJson } from '@/lib/storage';

import { AppNotification, buildNotifications, unreadNotifications } from './buildNotifications';

const SEEN_KEY = 'notifications_last_seen';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let lastSeenAt: string | null = readJson<string | null>(SEEN_KEY, null);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLastSeenNotifications(): string | null {
  return lastSeenAt;
}

export function markNotificationsSeen(now = new Date()) {
  lastSeenAt = now.toISOString();
  writeJson(SEEN_KEY, lastSeenAt);
  listeners.forEach((listener) => listener());
}

export function useNotifications(): { items: AppNotification[]; unread: number } {
  const chat = useChat();
  const progress = useSessionProgress();
  const seen = useSyncExternalStore(subscribe, () => lastSeenAt);
  // Time-based items (mood, check-in) are refreshed whenever the screen comes into view.
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => setNow(new Date()), []));

  const items = useMemo(() => {
    const assignment = getAssignment();
    const researcher = MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId);
    const checkIn = getNextCheckIn(researcher?.id, now);
    const joinedAt = getConsent()?.agreedAt ?? assignment?.assignedAt;
    const week = currentStudyWeek(now);
    const session = SESSIONS[week - 1];
    const lastMessage = [...chat.messages].reverse().find((m) => m.from === 'researcher');

    return buildNotifications({
      now,
      researcherName: researcher ? firstName(researcher.name) : undefined,
      unreadMessages: chat.unread,
      lastMessageAt: lastMessage?.sentAt,
      checkIn: checkIn
        ? { startsAt: checkIn.startsAt, phase: checkInPhase(checkIn, now) }
        : undefined,
      moodLoggedToday: todaysMood(now) !== null,
      session: {
        id: session.id,
        title: session.title,
        complete: Boolean(progress[session.id]?.completedAt),
        opensAt: joinedAt
          ? new Date(new Date(joinedAt).getTime() + (session.id - 1) * WEEK_MS).toISOString()
          : undefined,
      },
      joinedAt,
    });
  }, [chat, progress, now]);

  return { items, unread: unreadNotifications(items, seen) };
}
