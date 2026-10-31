import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useChat } from '@/features/chat/chatStore';
import { getCheckInHistory } from '@/features/checkin/checkinStore';
import { useJournal } from '@/features/journal/journalStore';
import { getMoodLog } from '@/features/mood/moodStore';
import { useSessionProgress } from '@/features/sessions/progressStore';

import { achievementStates } from './achievements';
import { getSeenLevels } from './achievementsSeen';

/** Every achievement's state from the student's real activity, plus which tiers are new. */
export function useAchievements() {
  const progress = useSessionProgress();
  const journal = useJournal();
  const { messages } = useChat();
  // Moods, calls and seen tiers aren't live stores, so they're re-read whenever a screen focuses.
  const [snapshot, setSnapshot] = useState(() => ({
    moods: getMoodLog(),
    calls: getCheckInHistory().map((c) => c.at),
    seen: getSeenLevels(),
  }));
  useFocusEffect(
    useCallback(
      () =>
        setSnapshot({
          moods: getMoodLog(),
          calls: getCheckInHistory().map((c) => c.at),
          seen: getSeenLevels(),
        }),
      []
    )
  );

  const states = achievementStates({
    moods: snapshot.moods,
    sessions: Object.values(progress).flatMap((r) => (r.completedAt ? [r.completedAt] : [])),
    journal: journal.map((e) => e.at),
    calls: snapshot.calls,
    messages: messages.filter((m) => m.from === 'student').map((m) => m.sentAt),
  });
  return { states, seen: snapshot.seen };
}
