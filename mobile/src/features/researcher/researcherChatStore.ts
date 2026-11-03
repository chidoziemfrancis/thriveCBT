import { useSyncExternalStore } from 'react';

import type { Message } from '@/features/chat/chatLogic';
import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'researcher_chat';

/**
 * The researcher's side of each chat, kept on their phone until the backend delivers messages
 * both ways: what they've sent, when they last read each thread, and which are flagged.
 */
export type ResearcherChatState = {
  sent: Record<string, Message[]>;
  readAt: Record<string, string>;
  followUp: string[];
};

let state: ResearcherChatState = readJson<ResearcherChatState>(STORAGE_KEY, {
  sent: {},
  readAt: {},
  followUp: [],
});
const listeners = new Set<() => void>();

function save(next: ResearcherChatState) {
  state = next;
  writeJson(STORAGE_KEY, state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useResearcherChat(): ResearcherChatState {
  return useSyncExternalStore(subscribe, () => state);
}

export function sendToStudent(studentId: string, text: string, now = new Date()): Message {
  const message: Message = {
    id: `r${now.getTime()}`,
    from: 'researcher',
    text: text.trim(),
    sentAt: now.toISOString(),
    status: 'sent',
  };
  save({
    ...state,
    sent: { ...state.sent, [studentId]: [...(state.sent[studentId] ?? []), message] },
  });
  return message;
}

export function markThreadRead(studentId: string, now = new Date()) {
  save({ ...state, readAt: { ...state.readAt, [studentId]: now.toISOString() } });
}

export function toggleFollowUp(studentId: string) {
  const flagged = state.followUp.includes(studentId);
  save({
    ...state,
    followUp: flagged
      ? state.followUp.filter((id) => id !== studentId)
      : [...state.followUp, studentId],
  });
}
