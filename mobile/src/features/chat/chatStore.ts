import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import { Message, unreadCount } from './chatLogic';
import { containsRiskLanguage } from './riskLanguage';

const STORAGE_KEY = 'chat';

// Stands in for the realtime backend: the "researcher" reads, types, then replies.
const READ_AFTER_MS = 900;
const TYPING_AFTER_MS = 1500;
const REPLY_AFTER_MS = 3200;

const MOCK_REPLIES = [
  'Thanks for your message! How are you finding things this week?',
  'That makes a lot of sense. Want to talk it through at our next check-in?',
  'I hear you. Small steps count, and you’re doing them.',
  'Good question. Have a look at this week’s session, and message me if it’s still unclear.',
];

const RISK_REPLY =
  'Thank you for telling me. I’m going to reach out to you directly very soon. If you’re in danger right now, please tap Help or call your local emergency number.';

type Stored = { messages: Message[]; lastReadAt: string | null };
export type ChatState = Stored & { typing: boolean; unread: number };

function load(): ChatState {
  const stored = readJson<Stored>(STORAGE_KEY, { messages: [], lastReadAt: null });
  return { ...stored, typing: false, unread: unreadCount(stored.messages, stored.lastReadAt) };
}

let state: ChatState = load();
let chatOpen = false;
const listeners = new Set<() => void>();

function update(patch: Partial<Stored & { typing: boolean }>) {
  const next = { ...state, ...patch };
  state = { ...next, unread: unreadCount(next.messages, next.lastReadAt) };
  writeJson(STORAGE_KEY, { messages: state.messages, lastReadAt: state.lastReadAt });
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useChat(): ChatState {
  return useSyncExternalStore(subscribe, () => state);
}

export function markChatRead() {
  if (state.unread > 0) update({ lastReadAt: new Date().toISOString() });
}

/** While the chat is on screen, incoming messages count as read straight away. */
export function setChatOpen(open: boolean) {
  chatOpen = open;
  if (open) markChatRead();
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sendMessage(text: string): Message {
  const message: Message = {
    id: newId(),
    from: 'student',
    text: text.trim(),
    sentAt: new Date().toISOString(),
    status: 'sent',
    flagged: containsRiskLanguage(text),
  };
  update({ messages: [...state.messages, message] });
  scheduleMockReply(message);
  return message;
}

function scheduleMockReply(sent: Message) {
  const replyIndex = state.messages.filter((m) => m.from === 'researcher').length;
  const reply = sent.flagged ? RISK_REPLY : MOCK_REPLIES[replyIndex % MOCK_REPLIES.length];

  setTimeout(() => {
    update({
      messages: state.messages.map((m) =>
        m.from === 'student' && m.status === 'sent' ? { ...m, status: 'read' } : m
      ),
    });
  }, READ_AFTER_MS);
  setTimeout(() => update({ typing: true }), TYPING_AFTER_MS);
  setTimeout(() => {
    const now = new Date().toISOString();
    update({
      typing: false,
      messages: [
        ...state.messages,
        { id: newId(), from: 'researcher', text: reply, sentAt: now, status: 'sent' },
      ],
      ...(chatOpen ? { lastReadAt: now } : {}),
    });
  }, REPLY_AFTER_MS);
}
